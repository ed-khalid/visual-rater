import { create } from 'zustand'
import type { Track } from '../shared/suggestions'
import { assignBranches, autoAlign, chooseBranch, clashes, directionNear, MAX_BRANCH_LENGTH, MIN_BRANCH_LENGTH, NEAR_POSITION, preferredDirection, ringLength } from './layout'

import type { Board, Item, ItemSource, ItemType, Persisted, Placement } from '../shared/model'
export type { Board, Item, ItemSource, ItemType, Persisted, Placement, Staged } from '../shared/model'

/** Details that can be filled in on an item after it's added. */
export type ItemDetails = Pick<Item, 'image' | 'artist' | 'year' | 'tracks'>

/** Where a newly added item lands until it's dragged. */
export const NEW_ITEM_POSITION = 0.5

/** The starting types. Users can add their own alongside these. */
export const BUILT_IN_TYPES: ItemType[] = [
  { id: 'music', name: 'MUSIC', builtIn: true },
  { id: 'movies', name: 'MOVIES', builtIn: true },
  { id: 'books', name: 'BOOKS', builtIn: true },
]

export type State = Persisted & {
  /** null means no board is open: the type picker is showing. */
  activeBoardId: string | null
}

type Actions = {
  /** Opens the board for a type, creating it the first time. */
  openType: (typeId: string) => void
  /** Adds a custom type and returns it; if one with that name exists (any case), returns that instead. Null for a blank name. */
  addType: (name: string) => ItemType | null
  /** Back to the type picker. */
  closeBoard: () => void
  /**
   * Adds an item to the open board: placed on the axis, or with `stage: true` into the staging tray.
   * Returns the new item, or null if no board is open, the name is blank, or it's already on the board,
   * placed or staged (same catalogue entry, or for typed items the same name).
   */
  addItem: (name: string, extra?: Partial<ItemDetails> & { source?: ItemSource }, opts?: { stage?: boolean }) => Item | null
  /** Fills in details on an existing item (e.g. an album's tracklist once it has loaded). Undefined fields are left alone. */
  setItemDetails: (itemId: string, details: Partial<ItemDetails>) => void
  /**
   * User edits to an item: a new title, year (null clears it) or tracklist. Titles and track names are trimmed;
   * blank ones are rejected (returns false, nothing changes). Tracks are renumbered 1, 2, 3… within each disc.
   */
  editItem: (itemId: string, edit: { name?: string, year?: number | null, tracks?: Track[] }) => boolean
  /**
   * Adds a staged album's tracks to the open board (each becomes its own item on the tree, carrying the album's
   * cover, artist and year), and moves the album from the tray to the added column. Tracks already on the board
   * are skipped. Returns how many tracks were added, or null if the album isn't staged here.
   */
  addAlbumTracks: (albumId: string) => number | null
  /**
   * Moves a placed item on the open board: `position` up or down the trunk (0–1), `length` of its branch. Both are
   * clamped. If the new height puts its branch too close to another one, only this item's branch turns, to the
   * nearest free direction; nothing else moves.
   */
  movePlacement: (itemId: string, move: { position?: number, length?: number }) => void
  /**
   * Re-lays out every item on the open board's tree so as many as possible sit on the main plane (left and right
   * of the trunk, facing the starting view), lengthening or shortening stems to keep fruit apart, and swinging
   * items to other planes once a stem would pass the threshold (see layout.autoAlign). Heights never change.
   */
  autoAlignBoard: () => void
  /**
   * Takes an item off the open board, whether it's staged, an added album, or placed on the axis, and drops the item itself if
   * no other board uses it.
   */
  removeFromBoard: (itemId: string) => void
}

const normalise = (name: string) => name.trim().replace(/\s+/g, ' ')

export const initialState = (): State => ({
  types: Object.fromEntries(BUILT_IN_TYPES.map(t => [t.id, t])),
  items: {},
  boards: {},
  placements: [],
  staged: [],
  added: [],
  activeBoardId: null,
})

/** Items on the open board, placed or staged. */
const itemsOnActiveBoard = (s: State) => [
  ...s.placements.filter(p => p.boardId === s.activeBoardId),
  ...s.staged.filter(p => p.boardId === s.activeBoardId),
  ...s.added.filter(p => p.boardId === s.activeBoardId),
].map(p => s.items[p.itemId]).filter(Boolean)

const sameSource = (a: ItemSource | undefined, b: ItemSource) =>
  a?.provider === b.provider && a.kind === b.kind && a.id === b.id

/** Whether an item with this name is on the open board, placed or staged. */
export const isOnActiveBoard = (s: State, name: string) => {
  const wanted = normalise(name).toLowerCase()
  return itemsOnActiveBoard(s).some(item => item.name.toLowerCase() === wanted)
}

/** Whether this catalogue entry is on the open board: 'placed', 'staged', or false. */
export const sourceStatusOnActiveBoard = (s: State, source: ItemSource): 'placed' | 'staged' | false => {
  const match = (p: { boardId: string, itemId: string }) => p.boardId === s.activeBoardId && sameSource(s.items[p.itemId]?.source, source)
  return s.placements.some(match) || s.added.some(match) ? 'placed' : s.staged.some(match) ? 'staged' : false
}

export const isSourceOnActiveBoard = (s: State, source: ItemSource) => sourceStatusOnActiveBoard(s, source) !== false

/** The scoring scale: 0 at the bottom of the trunk, 100 at the top. */
export const SCORE_MIN = 0
export const SCORE_MAX = 100

/** A placement's score (0–100, continuous) from its position on the trunk (0–1). */
export const positionToScore = (position: number) => SCORE_MIN + Math.min(1, Math.max(0, position)) * (SCORE_MAX - SCORE_MIN)
/** The position (0–1) for a score (0–100). */
export const scoreToPosition = (score: number) => Math.min(1, Math.max(0, (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)))
/** A score as shown in the UI: a whole number. */
export const formatScore = (score: number) => String(Math.round(score))

/** How an item's rating reads in the UI: UNRATED until it has a position on the trunk, then its 0–100 score. */
export const ratingLabel = (s: State, itemId: string) => {
  const placed = s.placements.find(p => p.boardId === s.activeBoardId && p.itemId === itemId)
  return placed ? formatScore(positionToScore(placed.position)) : 'UNRATED'
}

export const findType = (s: State, name: string) => {
  const wanted = normalise(name).toUpperCase()
  return Object.values(s.types).find(t => t.name === wanted)
}

/** Upgrades state saved in localStorage by an older version (used when importing it into the database). */
export const migrateState = (persisted: unknown, version: number): State => {
  // v1 had no item types and only ever held throwaway prototype data, so it's dropped.
  if (version < 2) return initialState()
  let s = persisted as State
  // v2 → v3 added the staging tray.
  if (version < 3) s = { ...s, staged: [] }
  // v3 → v4 added the column of albums whose tracks are on the board.
  if (version < 4) s = { ...s, added: [] }
  // v4 → v5 stores each placement's branch; lay out each board exactly as it was being drawn.
  if (version < 5) s = { ...s, placements: withStoredBranches(s.placements as Omit<Placement, 'angle' | 'length' | 'ring'>[]) }
  return s
}

/** Branches for placements saved before branches were stored: per board, in placement order, as drawn then. */
const withStoredBranches = (placements: Omit<Placement, 'angle' | 'length' | 'ring'>[]): Placement[] => {
  const out = new Map<Omit<Placement, 'angle' | 'length' | 'ring'>, Placement>()
  for (const boardId of new Set(placements.map(p => p.boardId))) {
    const onBoard = placements.filter(p => p.boardId === boardId).sort((a, b) => a.placedAt - b.placedAt)
    const branches = assignBranches(onBoard.map(p => p.position), NEAR_POSITION)
    onBoard.forEach((p, i) => out.set(p, { ...p, ...branches[i] }))
  }
  return placements.map(p => out.get(p)!)
}

/** A new placement on a board, with a branch that doesn't clash with the ones already there. */
const newPlacement = (placements: Placement[], boardId: string, itemId: string, position: number, placedAt: number): Placement => {
  const onBoard = placements.filter(p => p.boardId === boardId)
  const branch = chooseBranch(position, onBoard.map(p => ({ y: p.position, angle: p.angle, ring: p.ring })), NEAR_POSITION, preferredDirection(onBoard.length))
  return { boardId, itemId, position, placedAt, ...branch }
}

/**
 * The app's state. Saved to the database by state/remote.ts, which loads it on startup and sends every change to
 * the API server; this store itself only holds it in memory.
 */
export const useStore = create<State & Actions>()((set, get) => ({
  ...initialState(),

  openType: (typeId) => {
    const s = get()
    const type = s.types[typeId]
    if (!type) return
    const existing = Object.values(s.boards).find(b => b.typeId === typeId)
    if (existing) return set({ activeBoardId: existing.id })
    const board: Board = { id: crypto.randomUUID(), typeId, name: type.name, axis: 'linear', bands: [] }
    set({ boards: { ...s.boards, [board.id]: board }, activeBoardId: board.id })
  },

  addType: (rawName) => {
    const name = normalise(rawName).toUpperCase()
    if (!name) return null
    const s = get()
    const existing = findType(s, name)
    if (existing) return existing
    const type: ItemType = { id: crypto.randomUUID(), name, builtIn: false }
    set({ types: { ...s.types, [type.id]: type } })
    return type
  },

  closeBoard: () => set({ activeBoardId: null }),

  setItemDetails: (itemId, details) => {
    const s = get()
    const item = s.items[itemId]
    if (!item) return
    const defined = Object.fromEntries(Object.entries(details).filter(([, v]) => v !== undefined))
    set({ items: { ...s.items, [itemId]: { ...item, ...defined } } })
  },

  editItem: (itemId, edit) => {
    const s = get()
    const item = s.items[itemId]
    if (!item) return false
    const next: Item = { ...item }
    if (edit.name !== undefined) {
      const name = normalise(edit.name)
      if (!name) return false
      next.name = name
    }
    if (edit.year !== undefined) {
      if (edit.year === null) delete next.year
      else if (!Number.isInteger(edit.year)) return false
      else next.year = edit.year
    }
    if (edit.tracks !== undefined) {
      const tracks = edit.tracks.map(t => ({ ...t, name: normalise(t.name) }))
      if (tracks.some(t => !t.name)) return false
      const perDisc = new Map<number, number>()
      next.tracks = tracks.map(t => {
        const number = (perDisc.get(t.disc) ?? 0) + 1
        perDisc.set(t.disc, number)
        return { ...t, number }
      })
    }
    set({ items: { ...s.items, [itemId]: next } })
    return true
  },

  addAlbumTracks: (albumId) => {
    const s = get()
    const board = s.activeBoardId ? s.boards[s.activeBoardId] : null
    const album = s.items[albumId]
    if (!board || !album || !s.staged.some(st => st.itemId === albumId && st.boardId === board.id)) return null
    const now = Date.now()
    const items = { ...s.items }
    const placements = [...s.placements]
    let count = 0
    for (const track of album.tracks ?? []) {
      const source: ItemSource | undefined = album.source?.provider === 'spotify' ? { provider: 'spotify', kind: 'track', id: track.id } : undefined
      const already = source
        ? sourceStatusOnActiveBoard({ ...s, items, placements }, source)
        : placements.some(p => p.boardId === board.id && items[p.itemId]?.albumId === albumId && items[p.itemId]?.name === track.name)
      if (already) continue
      const item: Item = { id: crypto.randomUUID(), typeId: board.typeId, name: track.name, image: album.image, artist: album.artist, year: album.year, albumId, source }
      items[item.id] = item
      // placedAt increases by track, so the tree lays them out in tracklist order
      placements.push(newPlacement(placements, board.id, item.id, NEW_ITEM_POSITION, now + count))
      count++
    }
    set({
      items,
      placements,
      staged: s.staged.filter(st => !(st.itemId === albumId && st.boardId === board.id)),
      added: [...s.added, { boardId: board.id, itemId: albumId, stagedAt: now }],
    })
    return count
  },

  movePlacement: (itemId, move) => {
    const s = get()
    const index = s.placements.findIndex(p => p.itemId === itemId && p.boardId === s.activeBoardId)
    if (index < 0) return
    const current = s.placements[index]
    let next: Placement = { ...current }
    if (move.position !== undefined) next.position = Math.min(1, Math.max(0, move.position))
    if (move.position !== undefined) {
      const others = s.placements.filter((p, i) => i !== index && p.boardId === current.boardId).map(p => ({ y: p.position, angle: p.angle, ring: p.ring }))
      if (clashes(next.position, next, others, NEAR_POSITION)) {
        const branch = chooseBranch(next.position, others, NEAR_POSITION, directionNear(current.angle, current.ring))
        const custom = current.length !== ringLength(current.ring)
        next = { ...next, angle: branch.angle, ring: branch.ring, length: custom ? current.length : branch.length }
      }
    }
    if (move.length !== undefined) next.length = Math.min(MAX_BRANCH_LENGTH, Math.max(MIN_BRANCH_LENGTH, move.length))
    const placements = [...s.placements]
    placements[index] = next
    set({ placements })
  },

  autoAlignBoard: () => {
    const s = get()
    const indexes = s.placements.flatMap((p, i) => p.boardId === s.activeBoardId ? [i] : [])
    // Ties at the same height keep placement order, so the layout doesn't reshuffle for no reason.
    indexes.sort((a, b) => s.placements[a].placedAt - s.placements[b].placedAt)
    const branches = autoAlign(indexes.map(i => s.placements[i].position))
    const placements = [...s.placements]
    indexes.forEach((i, k) => { placements[i] = { ...placements[i], ...branches[k] } })
    set({ placements })
  },

  removeFromBoard: (itemId) => {
    const s = get()
    const here = (x: { boardId: string, itemId: string }) => x.itemId === itemId && x.boardId === s.activeBoardId
    const staged = s.staged.filter(x => !here(x))
    const added = s.added.filter(x => !here(x))
    const placements = s.placements.filter(x => !here(x))
    const stillUsed = [...staged, ...added, ...placements].some(x => x.itemId === itemId)
    const items = { ...s.items }
    if (!stillUsed) delete items[itemId]
    set({ staged, added, placements, items })
  },

  addItem: (rawName, extra = {}, opts = {}) => {
    const name = normalise(rawName)
    const s = get()
    const board = s.activeBoardId ? s.boards[s.activeBoardId] : null
    if (!board || !name) return null
    // Catalogue picks are matched by their catalogue id (two artists can share a name); typed items by name.
    if (extra.source ? isSourceOnActiveBoard(s, extra.source) : isOnActiveBoard(s, name)) return null
    const item: Item = { id: crypto.randomUUID(), typeId: board.typeId, name, ...extra }
    const now = Date.now()
    set(opts.stage
      ? { items: { ...s.items, [item.id]: item }, staged: [...s.staged, { boardId: board.id, itemId: item.id, stagedAt: now }] }
      : { items: { ...s.items, [item.id]: item }, placements: [...s.placements, newPlacement(s.placements, board.id, item.id, NEW_ITEM_POSITION, now)] })
    return item
  },
}))

/** Key and version of the data v2 kept in localStorage before it had a database, for the one-time import. */
export const LEGACY_STORAGE_KEY = 'visual-rater-v2'
export const LEGACY_STORAGE_VERSION = 5
