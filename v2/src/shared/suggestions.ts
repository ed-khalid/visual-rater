/** Shared between the server (which produces these) and the app (which shows them). */

/** A match from an outside catalogue, offered while adding an item. */
export type Suggestion = {
  provider: 'spotify'
  /** What sort of catalogue entry this is (one MUSIC board can hold both). */
  kind: 'artist' | 'album'
  id: string
  name: string
  image?: string
  /** Albums only: the edition tag taken off the catalogue's name, e.g. "Remastered Deluxe Box Set" (see shared/names). */
  edition?: string
  /** One short line of context: genres for an artist, artist and year for an album. */
  detail?: string
  /** Albums only: structured versions of what's in `detail` (the main artist, and their catalogue id). */
  artist?: string
  artistId?: string
  year?: number
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
