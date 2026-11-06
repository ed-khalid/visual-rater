import { ALBUM_GRADES, ARTIST_GRADES, type Tier, TRACK_TIERS, tierOf } from '../shared/tiers'
/**
 * What each type's tree shows, worked out from the saved collections (nothing about boards is stored):
 *
 * - **On the tree** (draggable fruit): MUSIC tracks, MOVIES and BOOKS that have a branch and aren't hidden.
 * - **Staging tray** (left, MUSIC): albums whose tracks haven't been put on the tree yet.
 * - **Added column** (right, MUSIC, read-only): albums whose tracks are on the tree, and their artists.
 *
 * Album and artist scores come from their tracks (scores.ts); they're never dragged.
 */
import type { Album, Artist, Collection, Persisted, Rateable, Simple, Track, TypeId } from '../shared/model'
import { albumScore, artistScore } from './scores'

/** Where an unrated item sits on the trunk (0 bottom … 1 top) until it's dragged. */
export const UNRATED_POSITION = 0.5

/** Something drawn as fruit on a tree. */
export type TreeNode = { id: string, collection: 'tracks' | 'movies' | 'books', entity: Track | Simple }

const rateableCollection = (type: TypeId): 'tracks' | 'movies' | 'books' =>
  type === 'music' ? 'tracks' : type

/** Height on the trunk: its score, or the middle while unrated. */
export const positionOf = (r: Rateable) => r.score !== undefined ? r.score / 100 : UNRATED_POSITION

/** Fruit on a type's tree, in the order they went on it. */
export const treeNodes = (s: Persisted, type: TypeId): TreeNode[] => {
  const collection = rateableCollection(type)
  const all = Object.values(s[collection]) as (Track | Simple)[]
  return all
    .filter(e => e.branch && !e.hidden)
    .sort((a, b) => (a.since ?? 0) - (b.since ?? 0))
    .map(entity => ({ id: entity.id, collection, entity }))
}

/** Albums in the staging tray, oldest first. */
export const stagedAlbums = (s: Persisted): Album[] =>
  Object.values(s.albums).filter(a => a.addedAt === undefined).sort((a, b) => a.stagedAt - b.stagedAt)

/** The added column: albums whose tracks are on the tree (oldest first), then their artists. */
export const addedColumn = (s: Persisted): { id: string, collection: 'albums' | 'artists' }[] => {
  const albums = Object.values(s.albums).filter(a => a.addedAt !== undefined).sort((a, b) => a.addedAt! - b.addedAt!)
  const artists = [...new Set(albums.map(a => a.artistId).filter((id): id is string => !!id && !!s.artists[id]))]
  return [...albums.map(a => ({ id: a.id, collection: 'albums' as const })), ...artists.map(id => ({ id, collection: 'artists' as const }))]
}

/** An album's tracks (its tracklist), in disc then track order. */
export const tracksOf = (s: Pick<Persisted, 'tracks'>, albumId: string): Track[] =>
  Object.values(s.tracks).filter(t => t.albumId === albumId).sort((a, b) => (a.disc ?? 0) - (b.disc ?? 0) || (a.number ?? 0) - (b.number ?? 0))

/** Every track by an artist, on any album. */
export const tracksByArtist = (s: Pick<Persisted, 'tracks'>, artistId: string): Track[] =>
  Object.values(s.tracks).filter(t => t.artistId === artistId)

/** Which collection an id belongs to (our ids are unique across all of them). */
export const collectionOf = (s: Persisted, id: string): Collection | undefined =>
  (['tracks', 'albums', 'artists', 'movies', 'books'] as Collection[]).find(c => id in s[c])

export type Found =
  | { collection: 'tracks', entity: Track }
  | { collection: 'albums', entity: Album }
  | { collection: 'artists', entity: Artist }
  | { collection: 'movies' | 'books', entity: Simple }

export const find = (s: Persisted, id: string | null | undefined): Found | undefined => {
  if (!id) return undefined
  const collection = collectionOf(s, id)
  return collection ? { collection, entity: s[collection][id] } as Found : undefined
}

/** A score as shown: whole numbers on the 0–100 scale; artist scores (open-ended) to one decimal. */
export const formatScore = (score: number) => String(Math.round(score))

/** A song's tier, by its score as shown (rounded), so the number and the tier name beside it always agree. */
export const songTier = (score: number) => tierOf(TRACK_TIERS, Math.round(score))!
export const formatArtistScore = (score: number) => score.toFixed(1)

/** How something's rating reads in the UI: its own score, its tracks' (albums, artists), or UNRATED; with its tier
 * (a track's song tier, an album's or artist's letter grade) on MUSIC. Tiers go by the score as shown, so the
 * number and the tier beside it always agree. */
export const rating = (s: Persisted, id: string): { label: string, tier?: Tier } => {
  const f = find(s, id)
  const unrated = { label: 'UNRATED' }
  if (!f) return unrated
  if (f.collection === 'albums') {
    const v = albumScore(tracksOf(s, id))
    return v === undefined ? unrated : { label: formatScore(v), tier: tierOf(ALBUM_GRADES, Math.round(v)) }
  }
  if (f.collection === 'artists') {
    const v = artistScore(tracksByArtist(s, id))
    return v === undefined ? unrated : { label: formatArtistScore(v), tier: tierOf(ARTIST_GRADES, Number(formatArtistScore(v))) }
  }
  if (f.entity.score === undefined) return unrated
  return { label: formatScore(f.entity.score), tier: f.collection === 'tracks' ? songTier(f.entity.score) : undefined }
}

export const ratingLabel = (s: Persisted, id: string): string => rating(s, id).label

/** The type a saved thing belongs to. */
export const typeOf = (collection: Collection): TypeId =>
  collection === 'movies' ? 'movies' : collection === 'books' ? 'books' : 'music'

/**
 * Active rating: while any of `batch` (fruit just added, unrated) is still on the tree unrated, the things to keep
 * bright are those fruit (rated or not by now) and, on MUSIC, their albums and artists; everything else fades.
 * Null once every one of them has a score (or left the tree), which ends it.
 */
export const ratingFocus = (s: Persisted, type: TypeId, batch: readonly string[]): Set<string> | null => {
  const ids = new Set(batch)
  const mine = treeNodes(s, type).filter(n => ids.has(n.id))
  if (!mine.some(n => n.entity.score === undefined)) return null
  const focus = new Set(mine.map(n => n.id))
  for (const n of mine) {
    const t = n.entity as Track
    if (t.albumId) focus.add(t.albumId)
    if (t.artistId) focus.add(t.artistId)
  }
  return focus
}

/** How far (in points, either way) a rated item's score may be from the one being dragged to and still be offered. */
export const SAME_SCORE_RANGE = 2

/**
 * Already-rated items of a type whose score is the same as `score` (as shown, rounded), or the nearest within
 * SAME_SCORE_RANGE: closest first, then most recently put on the tree. Hidden tracks count (their score was kept).
 * Used while a song is held still mid-drag, to compare it with songs already at that height.
 */
export const sameScore = (s: Persisted, type: TypeId, score: number, excludeId: string, limit = 5): (Track | Simple)[] => {
  const target = Math.round(score)
  const all = Object.values(s[rateableCollection(type)]) as (Track | Simple)[]
  return all
    .filter(e => e.id !== excludeId && e.score !== undefined && Math.abs(Math.round(e.score) - target) <= SAME_SCORE_RANGE)
    .sort((a, b) => Math.abs(Math.round(a.score!) - target) - Math.abs(Math.round(b.score!) - target) || (b.since ?? 0) - (a.since ?? 0))
    .slice(0, limit)
}
