/** Shared between the server (which produces these) and the app (which shows them). */

/** A match from an outside catalogue, offered while adding an item. */
export type Suggestion = {
  provider: 'spotify'
  /** What sort of catalogue entry this is (one MUSIC board can hold both). */
  kind: 'artist' | 'album'
  id: string
  name: string
  image?: string
  /** One short line of context: genres for an artist, artist and year for an album. */
  detail?: string
}

export type SuggestionsResponse =
  | { supported: true, results: Suggestion[] }
  /** This item type has no outside catalogue (yet): add by name only. */
  | { supported: false, results: [] }
