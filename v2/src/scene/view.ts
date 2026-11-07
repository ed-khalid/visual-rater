import { create } from 'zustand'

export type Phase = 'tree' | 'to-list' | 'list' | 'to-tree'

type View = {
  /** Counts up each time the reset button is pressed; the camera rig watches it. */
  resetRequests: number
  requestReset: () => void
  /**
   * Turn the camera to face a branch direction (radians, as stored on a branch): it glides round the vertical axis
   * until that branch's plane is face-on, whichever way round is nearer. The camera rig watches `seq`.
   */
  faceRequest: { angle: number, seq: number } | { azimuth: number, seq: number } | null
  requestFace: (angle: number) => void
  /** Turn the camera round the vertical axis to exactly this turn (radians, as cameraAzimuth), keeping the distance. */
  requestAzimuth: (azimuth: number) => void
  /** The item under the pointer, if any (drives the hover card). */
  hoveredId: string | null
  setHovered: (id: string | null) => void
  /** The item whose detail popup is open, if any. */
  openId: string | null
  toggleOpen: (id: string) => void
  close: () => void
  /** An item tapped or clicked on the tree: shows its trash icon on touch screens, which have no hover. */
  selectedId: string | null
  toggleSelected: (id: string) => void
  /** The fruit being dragged, if any: its action icons hide until it's dropped. */
  draggingId: string | null
  setDragging: (id: string | null) => void
  /** True while the open popup is in edit mode: a stray click on empty space shouldn't throw edits away. */
  editing: boolean
  setEditing: (editing: boolean) => void
  /**
   * The tree (3D rater) or the list (a plain table of everything on the tree, best first), and the transitions
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
   * Album view (MUSIC): the album picked in the catalog or the rater contents. Every other album's branches and fruit draw back
   * into the trunk (as for the list view), so only its tracks are on the tree. Null: everything shows. Leaving it,
   * however that happens, glides the camera home (as the reset button does), undoing album view's turn. While it's
   * on, the picture slides right (CameraReset's view offset) to make room for the album's title and details.
   */
  albumView: string | null
  setAlbumView: (id: string | null) => void
  /**
   * Albums taken off the tree for now, from the rater contents (MUSIC): their branches and fruit draw back into the
   * trunk, as in album view, but nothing about them changes and they come back with a click. Not saved.
   * Album view of one of them shows it anyway.
   */
  hiddenAlbums: ReadonlySet<string>
  /** Hide these albums, or show them again if they're all hidden already. */
  toggleAlbumsHidden: (ids: string[]) => void
  rating: string[] | null
  startRating: (ids: string[]) => void
  endRating: () => void
}

/**
 * UI state shared between the page and the 3D view (which lives inside the canvas and can't be reached
 * directly). Not persisted.
 */
export const useView = create<View>()(set => ({
  resetRequests: 0,
  requestReset: () => set(s => ({ resetRequests: s.resetRequests + 1 })),
  faceRequest: null,
  requestFace: angle => set(s => ({ faceRequest: { angle, seq: (s.faceRequest?.seq ?? 0) + 1 } })),
  requestAzimuth: azimuth => set(s => ({ faceRequest: { azimuth, seq: (s.faceRequest?.seq ?? 0) + 1 } })),
  hiddenAlbums: new Set(),
  toggleAlbumsHidden: ids => set(s => {
    const next = new Set(s.hiddenAlbums), all = ids.every(id => next.has(id))
    for (const id of ids) { if (all) next.delete(id); else next.add(id) }
    return { hiddenAlbums: next }
  }),
  hoveredId: null,
  setHovered: id => set({ hoveredId: id }),
  openId: null,
  toggleOpen: id => set(s => s.editing ? s : ({ openId: s.openId === id ? null : id })),
  close: () => set({ openId: null, editing: false, selectedId: null }),
  draggingId: null,
  setDragging: id => set({ draggingId: id }),
  selectedId: null,
  toggleSelected: id => set(s => ({ selectedId: s.selectedId === id ? null : id })),
  editing: false,
  setEditing: editing => set({ editing }),
  phase: 'tree',
  toggleMode: () => set(s => s.phase === 'tree'
    ? { phase: 'to-list', openId: null, editing: false, hoveredId: null, selectedId: null }
    : s.phase === 'list' ? { phase: 'to-tree' } : s),
  setPhase: phase => set({ phase }),
  albumView: null,
  setAlbumView: id => set(s => id === null && s.albumView !== null
    ? { albumView: null, resetRequests: s.resetRequests + 1 }
    : { albumView: id }),
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
 * Where things are on screen right now (CSS px): centre and apparent radius. Written by 3D objects every frame,
 * read by page overlays (hover card, popup) every frame, so they stay pinned while the view moves.
 */
export const screenAnchors = new Map<string, { x: number, y: number, r: number, visible: boolean, /** pinned overlays go on its left when they fit there (rows of the catalog) */ preferLeft?: boolean, /** half its width, if wider than r (a list row): popups go beside it, not over it */ halfWidth?: number }>()

/** The live score (0–100) of the fruit being dragged, written every frame while dragging; read by the drag readout. */
export const liveScores = new Map<string, number>()

/** The camera's turn round the vertical axis right now (radians, 0 = the starting view), written every frame by the camera rig. */
export const cameraAzimuth = { value: 0 }

/** Shortest signed turn from one angle to another. */
export const angleDelta = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

/** The camera turn that shows a branch's plane face-on, from whichever side is nearer `from`. */
export const facingAzimuth = (branchAngle: number, from: number) => {
  const a = branchAngle - Math.PI / 2, b = branchAngle + Math.PI / 2
  return Math.abs(angleDelta(from, a)) <= Math.abs(angleDelta(from, b)) ? a : b
}

/** Key in screenAnchors for the top of the trunk (published by Axis), where the tree/list switch sits. */
export const TRUNK_TOP_ANCHOR = '__trunk-top'

/** Key in screenAnchors for the bottom of the trunk (published by Axis). */
export const TRUNK_BOTTOM_ANCHOR = '__trunk-bottom'

/**
 * How far the tree has sunk into its trunk for the list view: 0 = fully out, 1 = every branch and fruit drawn in.
 * Eased over COLLAPSE_SECONDS by the stage (CollapseDriver); read every frame by the fruit and floating spheres.
 */
export const collapse = { value: 0 }
/** The list view waits for the collapse to finish before it opens. */
export const COLLAPSE_SECONDS = 0.3
