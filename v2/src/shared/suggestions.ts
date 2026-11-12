/** Shared between the server (which produces these) and the app (which shows them). */

/** A match from an outside catalogue, offered while adding an item. */
export type Suggestion = {
  provider: 'spotify'
  /** What sort of catalogue entry this is. */
  kind: 'artist' | 'album' | 'track'
  id: string
  name: string
  image?: string
  /** Albums only: the edition tag taken off the catalogue's name, e.g. "Remastered Deluxe Box Set" (see shared/names). */
  edition?: string
  /** One short line of context: genres for an artist, artist and year for an album. */
  detail?: string
  /** Albums and tracks: structured versions of what's in `detail` (the main artist, and their catalogue id). */
  artist?: string
  artistId?: string
  year?: number
  /** Tracks only: the album it's on (catalogue id and name), and its place and length there. */
  albumId?: string
  albumName?: string
  number?: number
  disc?: number
  durationMs?: number
}

export type Track = {
  id: string
  name: string
  /** Position on its disc, from 1. */
  number: number
  disc: number
  durationMs: number
}

/** An album with its full tracklist. */
export type AlbumDetails = {
  id: string
  name: string
  /** The main artist, and their catalogue id. */
  artist: string
  artistId?: string
  year?: number
  image?: string
  tracks: Track[]
}

export type SuggestionsResponse =
  | { supported: true, results: Suggestion[] }
  /** This item type has no outside catalogue (yet): add by name only. */
  | { supported: false, results: [] }
