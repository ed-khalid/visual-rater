/**
 * The entities v2 saves, shared by the app (src/state/) and the API server (server/), which keeps each kind in its
 * own Postgres table. Plain data only: no functions.
 *
 * There's no generic "item" or "board": each type (MUSIC, MOVIES, BOOKS) is its own tree, built from that type's
 * tables. Things that can be rated carry their own score and their branch on the tree (`Rateable`).
 */

/** The three types, one tree each. */
export type TypeId = 'music' | 'movies' | 'books'
export const TYPES: { id: TypeId, name: string }[] = [
  { id: 'music', name: 'MUSIC' },
  { id: 'movies', name: 'MOVIES' },
  { id: 'books', name: 'BOOKS' },
]

/**
 * An outside catalogue's id for something, used only to match it (and to fetch more about it). Our own ids are
 * always ours, so things that aren't in any catalogue work the same way.
 */
export type VendorRef = { name: 'spotify', id: string }

/** A branch on the 3D tree: direction around the trunk (radians), length (world units), ring (for spacing). */
export type Branch = { angle: number, length: number, ring: number }

/** What every saved thing has. */
type Base = {
  id: string
  name: string
  image?: string
  /** colors[0] is the raw dominant colour of the image ('#rrggbb'); the glow is derived from it when drawing. */
  colors?: string[]
}

/**
 * Something rated directly on a tree. `score` is 0–100 (undefined: unrated). `branch` is set the first time it
 * goes on the tree (`since` is when); `hidden` takes it off the tree but keeps its score.
 */
export type Rateable = {
  score?: number
  branch?: Branch
  since?: number
  hidden?: boolean
}

export type Artist = Base & { vendor?: VendorRef }

export type Album = Base & {
  vendor?: VendorRef
  artistId?: string
  year?: number
  /** Whether the tracklist has been fetched (or entered), so an album whose tracks were all deleted isn't fetched again. */
  tracklistLoaded: boolean
  /** When it was added; until its tracks are put on the tree it waits in the staging tray. */
  stagedAt: number
  /** When its tracks were put on the tree (it then floats to the right of the tree). */
  addedAt?: number
}

/** A track: what's rated on the MUSIC tree. An album's tracklist is its tracks in disc then number order. */
export type Track = Base & Rateable & {
  vendor?: VendorRef
  albumId?: string
  artistId?: string
  disc?: number
  /** Position on its disc, from 1. */
  number?: number
  durationMs?: number
  /** Left out of its artist's score (interludes, skits, live versions…). */
  excludeFromArtistScore?: boolean
  /** One or two words shown for it on the rater instead of its full name (names.ts `shortTitle`); unset on older tracks. */
  shortTitle?: string
}

/** A movie or a book: rated directly, nothing else attached (yet). */
export type Simple = Base & Rateable

/** Everything that's saved. */
export type Persisted = {
  artists: Record<string, Artist>
  albums: Record<string, Album>
  tracks: Record<string, Track>
  movies: Record<string, Simple>
  books: Record<string, Simple>
}

/** The saved collections, by name (what sync batches and the API are organised by). */
export type Collection = keyof Persisted
export const COLLECTIONS: Collection[] = ['artists', 'albums', 'tracks', 'movies', 'books']

export const emptyPersisted = (): Persisted => ({ artists: {}, albums: {}, tracks: {}, movies: {}, books: {} })
