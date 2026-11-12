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

/** What an artist's Misc album (`misc` on Album: their songs added on their own) is called when it's made. */
export const MISC_NAME = 'Singles'

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
  /**
   * The artist's "Misc" album (one each at most): songs added on their own whose real album isn't in the catalog. No
   * album score or grade, left out of the Career chart and the Albums zoom; its songs count for the artist as usual.
   */
  misc?: true
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
  /**
   * Not a song (a skit, spoken intro, interlude, hidden track…): in its album's tracklist, dim and tagged, but never on
   * the rater and counted for nothing: no score or tier, not in the album's average or completeness, the artist's
   * score, the FLOW chart's scores, the list view or the song counts. A score it had is kept, for if it's unmarked.
   * Set by hand in album view's EDIT; tracks named with "skit" get it when they're added (names.ts `isSkit`).
   */
  notASong?: boolean
  /**
   * A live recording of a song the artist already has (state/live.ts): rated, and counted for its album, but not for the
   * artist's score or their Songs by tier, so a song doesn't count twice. Tagged LIVE in the tracklist. Covers and songs
   * that only exist live aren't marked, so they count. Set when it's added if it matches; changed in album view's EDIT.
   */
  live?: boolean
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

/**
 * What the app starts with for an artist whose albums and tracks aren't loaded yet (they load when needed; see
 * GET /api/library/artists): their score, from the database's music_artist_scores view (the same formula as
 * state/scores.ts), how many albums they have, when the first of those went on the tree, and how many of their tracks
 * are on it (not hidden).
 */
export type ArtistInfo = { score?: number, albums: number, firstAdded?: number, fruit: number }

/** GET /api/counts: how many of each MUSIC record the database holds (albums: not counting Misc). */
export type MusicCounts = { artists: number, albums: number, songs: number }

/** How many artists a page of them holds (GET /api/state's first, GET /api/library/artists/page's after it). */
export const ARTIST_PAGE = 30

/**
 * Some artists with a summary of each (ArtistInfo), standing in for their albums and tracks until those are loaded.
 * A page of them (best first by artist score, unrated ones after by name) has `next`: where the next page starts
 * (an opaque cursor for GET /api/library/artists/page), null after the last.
 */
export type ArtistPage = { artists: Record<string, Artist>, artistInfo: Record<string, ArtistInfo>, next: string | null }

/** GET /api/library/artists/find: artists by Spotify id, by exact name (any case), or whose name contains `q`. */
export type ArtistQuery = { vendorIds?: string[], names?: string[], q?: string }

/**
 * GET /api/state: the first page of artists (ArtistPage, `next` for the rest), every movie and book, and only the
 * albums and tracks that belong to no artist.
 */
export type StartState = Persisted & { artistInfo: Record<string, ArtistInfo>, next: string | null }

/** GET /api/library/artists?ids=…: those artists' albums, and every track on them or credited to them. */
export type ArtistLibrary = Pick<Persisted, 'albums' | 'tracks'>

/** GET /api/library/tracks/near: a rated track, with its album's and artist's names. */
export type NearTrack = Track & { albumName?: string, artistName?: string }
