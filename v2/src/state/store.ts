import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** A kind of thing being ranked: MUSIC, MOVIES, BOOKS, or anything the user names. */
export type ItemType = {
  id: string
  name: string
  builtIn: boolean
}

/** Where an item came from, when it was picked from an outside catalogue rather than typed. */
export type ItemSource = { provider: 'spotify', kind: 'artist' | 'album', id: string }

/** Anything that can be ranked. `typeId` says what kind of thing it is. */
export type Item = {
  id: string
  typeId: string
  name: string
  image?: string
  colors?: string[]
  source?: ItemSource
}

/** A ranking medium for one item type. `axis` is how placements are laid out; `bands` are optional named regions drawn on it. */
export type Board = {
  id: string
  typeId: string
  name: string
  axis: 'linear'
  bands: { name: string, from: number, to: number }[]
}

/**
 * Where an item sits on a board. `position` is continuous, 0 (bottom) to 1 (top):
 * rank is the order of positions, and the gaps between them mean something.
 */
export type Placement = {
  boardId: string
  itemId: string
  position: number
  placedAt: number
}

/** An item that's been added to a board but not given a position yet: it waits in the staging tray. */
export type Staged = {
  boardId: string
  itemId: string
  stagedAt: number
}

/** Where a newly added item lands until it's dragged. */
export const NEW_ITEM_POSITION = 0.5

/** The starting types. Users can add their own alongside these. */
export const BUILT_IN_TYPES: ItemType[] = [
  { id: 'music', name: 'MUSIC', builtIn: true },
  { id: 'movies', name: 'MOVIES', builtIn: true },
  { id: 'books', name: 'BOOKS', builtIn: true },
]

export type State = {
  types: Record<string, ItemType>
  items: Record<string, Item>
  boards: Record<string, Board>
  placements: Placement[]
  staged: Staged[]
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
  addItem: (name: string, extra?: { image?: string, source?: ItemSource }, opts?: { stage?: boolean }) => Item | null
}

const normalise = (name: string) => name.trim().replace(/\s+/g, ' ')

export const initialState = (): State => ({
  types: Object.fromEntries(BUILT_IN_TYPES.map(t => [t.id, t])),
  items: {},
  boards: {},
  placements: [],
  staged: [],
  activeBoardId: null,
})

/** Items on the open board, placed or staged. */
const itemsOnActiveBoard = (s: State) => [
  ...s.placements.filter(p => p.boardId === s.activeBoardId),
  ...s.staged.filter(p => p.boardId === s.activeBoardId),
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
  return s.placements.some(match) ? 'placed' : s.staged.some(match) ? 'staged' : false
}

export const isSourceOnActiveBoard = (s: State, source: ItemSource) => sourceStatusOnActiveBoard(s, source) !== false

export const findType = (s: State, name: string) => {
  const wanted = normalise(name).toUpperCase()
  return Object.values(s.types).find(t => t.name === wanted)
}

/** Upgrades saved state from an older version. */
export const migrateState = (persisted: unknown, version: number): State => {
  // v2 → v3: adds the staging tray; everything else is unchanged.
  if (version === 2) return { ...(persisted as Omit<State, 'staged'>), staged: [] }
  // v1 had no item types and only ever held throwaway prototype data, so it's dropped.
  return initialState()
}

export const useStore = create<State & Actions>()(persist((set, get) => ({
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
      : { items: { ...s.items, [item.id]: item }, placements: [...s.placements, { boardId: board.id, itemId: item.id, position: NEW_ITEM_POSITION, placedAt: now }] })
    return item
  },
}), {
  name: 'visual-rater-v2',
  version: 3,
  migrate: migrateState,
  partialize: ({ types, items, boards, placements, staged, activeBoardId }) => ({ types, items, boards, placements, staged, activeBoardId }),
}))
