/**
 * The entities v2 saves, shared by the app (src/state/store.ts) and the API server (server/), which stores them in
 * Postgres. Plain data only: no functions.
 */
/** A kind of thing being ranked: MUSIC, MOVIES, BOOKS, or anything the user names. */
export type ItemType = {
  id: string
  name: string
  builtIn: boolean
}

/**
 * An outside catalogue's id for something, used only to match it (and to fetch more about it). The item's own id is
 * always ours, so things that aren't in any catalogue work the same way.
 */
export type VendorRef = { name: 'spotify', id: string }

export type MusicArtist = { kind: 'artist', vendor?: VendorRef }
export type MusicAlbum = {
  kind: 'album'
  vendor?: VendorRef
  /** The artist item. */
  artistId?: string
  year?: number
  /** Whether the tracklist has been fetched, so an album whose tracks were all deleted isn't fetched again. */
  tracklistLoaded: boolean
}
/** A track. Every track on an album is its own item, whether it's on a board or not. */
export type MusicTrack = {
  kind: 'track'
  vendor?: VendorRef
  /** The album item; the album's tracklist is its tracks in disc then number order. */
  albumId?: string
  /** The artist item. */
  artistId?: string
  disc?: number
  /** Position on its disc, from 1. */
  number?: number
  durationMs?: number
}
/** What a music item is, and how it links to the others. */
export type MusicDetails = MusicArtist | MusicAlbum | MusicTrack

/** Anything that can be ranked. `typeId` says what kind of thing it is. */
export type Item = {
  id: string
  typeId: string
  name: string
  image?: string
  colors?: string[]
  /** Music items picked from the catalogue, or made from one (an album's tracks and artist). Absent for typed items. */
  music?: MusicDetails
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
