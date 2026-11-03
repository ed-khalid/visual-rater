/**
 * The entities v2 saves, shared by the app (src/state/store.ts) and the API server (server/), which stores them in
 * Postgres. Plain data only: no functions.
 */
import type { Track } from './suggestions'

/** A kind of thing being ranked: MUSIC, MOVIES, BOOKS, or anything the user names. */
export type ItemType = {
  id: string
  name: string
  builtIn: boolean
}

/** Where an item came from, when it was picked from an outside catalogue rather than typed. */
export type ItemSource = { provider: 'spotify', kind: 'artist' | 'album' | 'track', id: string }

/** Anything that can be ranked. `typeId` says what kind of thing it is. */
export type Item = {
  id: string
  typeId: string
  name: string
  image?: string
  colors?: string[]
  source?: ItemSource
  /** Albums: who made it and when. */
  artist?: string
  year?: number
  /** Albums: the tracklist, filled in from the catalogue after the album is added. */
  tracks?: Track[]
  /** Tracks: the album item they came from. */
  albumId?: string
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
  /**
   * The item's branch on the 3D tree: direction around the trunk (radians), length (world units), and ring (for
   * spacing). Chosen when the item is placed and stored, so moving one item never moves the others.
   */
  angle: number
  length: number
  ring: number
}

/** An item that's been added to a board but not given a position yet: it waits in the staging tray. */
export type Staged = {
  boardId: string
  itemId: string
  stagedAt: number
}

/** Everything that's saved: the entities, without UI state such as which board is open. */
export type Persisted = {
  types: Record<string, ItemType>
  items: Record<string, Item>
  boards: Record<string, Board>
  placements: Placement[]
  staged: Staged[]
  /** Albums whose tracks have been added to the board: they float to the right of the tree. */
  added: Staged[]
}
