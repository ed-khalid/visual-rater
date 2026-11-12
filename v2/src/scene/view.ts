import { create } from 'zustand'

export type Phase = 'tree' | 'to-list' | 'list' | 'to-tree'
/** How far in MUSIC's default view goes (view.zoom). */
export type Zoom = 'artists' | 'albums' | 'songs'

type View = {
  /** The item under the pointer, if any (drives the hover card). */
  hoveredId: string | null
  setHovered: (id: string | null) => void
  /** Leaves edit mode. */
  close: () => void
  /** The fruit being dragged, if any. */
  draggingId: string | null
  setDragging: (id: string | null) => void
  /** True while the open popup is in edit mode: a stray click on empty space shouldn't throw edits away. */
  editing: boolean
  setEditing: (editing: boolean) => void
  /**
   * The tree (the rater) or the list (a plain table of everything on the tree, best first), and the transitions
   * between them: to-list (branches and fruit sink into the trunk, then the list opens out from the trunk line),
   * to-tree (the list closes back into the line, then the branches grow out again).
   */
  phase: Phase
  /** Starts the transition to the other view; ignored while one is already running. */
  toggleMode: () => void
  setPhase: (phase: Phase) => void
  /**
   * Active rating: the fruit just added unrated (an album's tracks, or something typed). While any of them is still
   * unrated, everything else on the scene fades (see board.ratingFocus); adding more joins in. Null: not rating.
   */
  /**
   * Album view (MUSIC): the album picked in the catalog. Every other album's branches and fruit draw back
   * into the trunk (as for the list view), so only its tracks are on the tree. Null: everything shows. While it's on,
   * the rater slides right to make room for the album's title and details.
   */
  albumView: string | null
  setAlbumView: (id: string | null) => void
  /**
   * Compare (album view, desktop): the screen splits in two, album view on the left and, mirrored on the right, the
   * album it's compared with (`compareWith`; null until one is picked), the two raters facing each other in the middle.
   * `picking`: the picker is open on the right (always, until an album is picked; CHANGE opens it again). Changing or
   * leaving album view ends it. Not saved.
   */
  comparing: boolean
  compareWith: string | null
  picking: boolean
  startCompare: () => void
  setCompareWith: (id: string) => void
  setPicking: (picking: boolean) => void
  endCompare: () => void
  /**
   * Albums taken off the tree for now, from the catalog's boxes (MUSIC): their branches and fruit draw back into the
   * trunk, as in album view, but nothing about them changes and they come back with a click. Not saved.
   * Album view of one of them shows it anyway.
   */
  hiddenAlbums: ReadonlySet<string>
  /** Hide these albums, or show them again if they're all hidden already. */
  toggleAlbumsHidden: (ids: string[]) => void
  rating: string[] | null
  startRating: (ids: string[]) => void
  endRating: () => void
  /**
   * Split view (MUSIC; state/split.ts): every album on its own rater, in a row that scrolls sideways. Album view and
   * the list view put them back on the one tree while they're up (isSplit). Not saved.
   */
  split: boolean
  setSplit: (split: boolean) => void
  /**
   * MUSIC's default view (state/drill.ts), whose: null, every artist on the rater; an artist's id, just that artist
   * (clicked on the rater, or picked in the breadcrumb). Setting one zooms to its albums; clearing it, back to the
   * artists. Not saved.
   */
  drill: string | null
  setDrill: (artistId: string | null) => void
  /**
   * MUSIC's default view, how far in: the artists, their albums, or their songs (hud/ZoomSwitch), for every artist on
   * the rater or just `drill`'s, leaving out albums taken off the rater (hiddenAlbums). Not saved.
   */
  zoom: Zoom
  setZoom: (zoom: Zoom) => void
  /** One step back: out of album view, else from one artist to all of them, else back out to the artists. */
  goBack: () => void
  /** The last thing done on the read-only rater, shown under the item count (hud/ActionLog). */
  lastAction: { text: string, seq: number } | null
  logAction: (text: string) => void
  /** Split view's raters in the order they were dragged into, by rater key (null: the order they went on the tree). */
  raterOrder: readonly string[] | null
  setRaterOrder: (order: readonly string[] | null) => void
}

/**
 * UI state shared between the board and the overlays around it. Not persisted.
 */
/** Compare off. */
const NO_COMPARE = { comparing: false, compareWith: null, picking: false }

export const useView = create<View>()(set => ({
  hiddenAlbums: new Set(),
  toggleAlbumsHidden: ids => set(s => {
    const next = new Set(s.hiddenAlbums), all = ids.every(id => next.has(id))
    for (const id of ids) { if (all) next.delete(id); else next.add(id) }
    return { hiddenAlbums: next }
  }),
  hoveredId: null,
  setHovered: id => set({ hoveredId: id }),
  close: () => set({ editing: false }),
  draggingId: null,
  setDragging: id => set({ draggingId: id }),
  editing: false,
  setEditing: editing => set({ editing }),
  phase: 'tree',
  toggleMode: () => set(s => s.phase === 'tree'
    ? { phase: 'to-list', editing: false, hoveredId: null }
    : s.phase === 'list' ? { phase: 'to-tree' } : s),
  setPhase: phase => set({ phase }),
  albumView: null,
  // Album view is always on the tree: opening it from the list view goes back to the tree.
  setAlbumView: id => set(s => ({
    albumView: id,
    ...(id && s.phase === 'list' ? { phase: 'to-tree' as const } : {}),
    ...(id !== s.albumView ? NO_COMPARE : {}),
  })),
  ...NO_COMPARE,
  startCompare: () => set({ comparing: true, compareWith: null, picking: true }),
  setCompareWith: id => set({ compareWith: id, picking: false }),
  setPicking: picking => set({ picking }),
  endCompare: () => set(NO_COMPARE),
  split: false,
  setSplit: split => set({ split }),
  drill: null,
  // Artists, and an artist's overview, are seen on the tree: going to either from the list view goes back to it.
  setDrill: drill => set(s => {
    const zoom: Zoom = drill ? 'albums' : 'artists'
    const tree = s.phase === 'list' ? { phase: 'to-tree' as const } : {}
    if (s.drill === drill && s.zoom === zoom) return tree
    levelChange.at = performance.now()
    return { drill, zoom, ...tree }
  }),
  zoom: 'artists',
  setZoom: zoom => set(s => {
    if (s.zoom === zoom) return s
    levelChange.at = performance.now()
    return { zoom, ...(zoom === 'artists' && s.phase === 'list' ? { phase: 'to-tree' as const } : {}) }
  }),
  goBack: () => {
    const s = useView.getState()
    if (s.picking && s.compareWith) s.setPicking(false)
    else if (s.comparing) s.endCompare()
    else if (s.albumView) s.setAlbumView(null)
    else if (s.drill) s.setDrill(null)
    else if (s.zoom !== 'artists') s.setZoom('artists')
  },
  lastAction: null,
  logAction: text => set(s => ({ lastAction: { text, seq: (s.lastAction?.seq ?? 0) + 1 } })),
  raterOrder: null,
  setRaterOrder: raterOrder => set({ raterOrder }),
  rating: null,
  startRating: ids => set(s => ids.length ? { rating: [...new Set([...(s.rating ?? []), ...ids])] } : s),
  endRating: () => set({ rating: null }),
}))

/**
 * What active rating keeps bright (board.ratingFocus), or null when not rating: kept up to date by the HUD's
 * RatingWatch, read every frame by the fruit and floating spheres, which fade everything else.
 */
export const ratingFocus: { ids: Set<string> | null } = { ids: null }
/** How dark faded things get in active rating (0: not at all, 1: gone). */
export const RATING_FADE = 0.82

/**
 * Where things are on screen right now (CSS px): centre and apparent radius. Written by the board (scene/anchors.ts) every frame,
 * read by page overlays (hover card, popup) every frame, so they stay pinned while the view moves.
 */
export const screenAnchors = new Map<string, { x: number, y: number, r: number, visible: boolean, /** pinned overlays go on its left when they fit there (rows of the catalog) */ preferLeft?: boolean, /** half its width, if wider than r (a list row): popups go beside it, not over it */ halfWidth?: number }>()

/** The live score (0–100) of the fruit being dragged, written every frame while dragging; read by the drag readout. */
export const liveScores = new Map<string, number>()


/** Key in screenAnchors for the top of the trunk (published by Axis), where the tree/list switch sits. */
export const TRUNK_TOP_ANCHOR = '__trunk-top'

/** Key in screenAnchors for the bottom of the trunk (published by Axis). */
export const TRUNK_BOTTOM_ANCHOR = '__trunk-bottom'

/**
 * How far the tree has sunk into its trunk for the list view: 0 = fully out, 1 = every branch and fruit drawn in.
 * Eased over COLLAPSE_SECONDS by the board (Board's CollapseDriver); the list view waits for it.
 */
export const collapse = { value: 0 }
/** The list view waits for the collapse to finish before it opens. */
export const COLLAPSE_SECONDS = 0.3

/** Whether the raters stand apart right now: split view is on, and neither album view nor the list view is up. */
export const isSplit = (v: Pick<View, 'split' | 'albumView' | 'phase'>) => v.split && !v.albumView && v.phase === 'tree'
/**
 * Artist view (MUSIC): an artist picked on the read-only rater (view.drill), outside album view and split view. Their
 * overview (hud/ArtistView.tsx) takes the left half, as album view's details do, and the rater moves right.
 */
export const artistView = (v: Pick<View, 'split' | 'albumView' | 'phase' | 'drill'>) =>
  v.drill && !v.albumView && !v.split && v.phase === 'tree' ? v.drill : null
/** Compare is up: album view, on the tree. */
export const isComparing = (v: Pick<View, 'comparing' | 'albumView' | 'phase'>) => v.comparing && !!v.albumView && v.phase === 'tree'

/** Album view or artist view: a panel on the left half, the rater on the right. */
export const sidePanel = (v: Pick<View, 'split' | 'albumView' | 'phase' | 'drill'>) => !!v.albumView || !!artistView(v)

/** The raters standing in split view's row right now, by rater key (state/split.raterKey), in order. */
export const raterNow = { keys: [] as string[] }
/** Key in screenAnchors for a rater's trunk top and bottom, in split view. */
export const raterTopAnchor = (key: string) => `__rater-top:${key}`
export const raterBottomAnchor = (key: string) => `__rater-bottom:${key}`

/**
 * When the read-only rater last changed level (artists ⟷ one artist's albums): the new level's fruit wait for the
 * old ones to draw back into the trunk before they come out.
 */
export const levelChange = { at: 0 }
/** How long after a level change the new fruit start to come out (ms). */
export const LEVEL_DELAY_MS = 320
