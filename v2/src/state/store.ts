import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** A kind of thing being ranked: MUSIC, MOVIES, BOOKS, or anything the user names. */
export type ItemType = {
  id: string
  name: string
  builtIn: boolean
}

/** Anything that can be ranked. `typeId` says what kind of thing it is. */
export type Item = {
  id: string
  typeId: string
  name: string
  image?: string
  colors?: string[]
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
  /** Adds an item to the open board. Returns the new item, or null if no board is open, the name is blank, or it's already on the board. */
  addItem: (name: string) => Item | null
}

const normalise = (name: string) => name.trim().replace(/\s+/g, ' ')

export const initialState = (): State => ({
  types: Object.fromEntries(BUILT_IN_TYPES.map(t => [t.id, t])),
  items: {},
  boards: {},
  placements: [],
  activeBoardId: null,
})

export const isOnActiveBoard = (s: State, name: string) => {
  const wanted = normalise(name).toLowerCase()
  return s.placements.some(p => p.boardId === s.activeBoardId && s.items[p.itemId]?.name.toLowerCase() === wanted)
}

export const findType = (s: State, name: string) => {
  const wanted = normalise(name).toUpperCase()
  return Object.values(s.types).find(t => t.name === wanted)
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

  addItem: (rawName) => {
    const name = normalise(rawName)
    const s = get()
    const board = s.activeBoardId ? s.boards[s.activeBoardId] : null
    if (!board || !name || isOnActiveBoard(s, name)) return null
    const item: Item = { id: crypto.randomUUID(), typeId: board.typeId, name }
    set({
      items: { ...s.items, [item.id]: item },
      placements: [...s.placements, { boardId: board.id, itemId: item.id, position: NEW_ITEM_POSITION, placedAt: Date.now() }],
    })
    return item
  },
}), {
  name: 'visual-rater-v2',
  // v1 had no item types and a single untyped board. It only ever held throwaway prototype data,
  // so it's dropped rather than migrated.
  version: 2,
  migrate: () => initialState(),
  partialize: ({ types, items, boards, placements, activeBoardId }) => ({ types, items, boards, placements, activeBoardId }),
}))
