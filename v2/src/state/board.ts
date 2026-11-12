import { ALBUM_GRADES, ARTIST_GRADES, type Tier, tierOf } from '../shared/tiers'
import { formatPrecise, formatScore as formatOnScale, roundToShown, toStored, TRACK_TIERS } from '../shared/scale'
/**
 * What each type's tree shows, worked out from the saved collections (nothing about boards is stored):
 *
 * - **On the tree** (draggable fruit): MUSIC tracks, MOVIES and BOOKS that have a branch and aren't hidden.
 * - **Staging tray** (left, MUSIC): albums whose tracks haven't been put on the tree yet.
 * - **Added column** (right, MUSIC, read-only): albums whose tracks are on the tree, and their artists.
 *
 * Album and artist scores come from their tracks (scores.ts); they're never dragged.
 */
import type { Album, Artist, ArtistInfo, Collection, Persisted, Rateable, Simple, Track, TypeId } from '../shared/model'
import { albumScore, artistScore, isIncomplete } from './scores'

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
    // Not a song (a skit…): never on the rater.
    .filter(e => e.branch && !e.hidden && !(e as Track).notASong)
    .sort((a, b) => (a.since ?? 0) - (b.since ?? 0))
    .map(entity => ({ id: entity.id, collection, entity }))
}

/** Staged albums (in the database, not on the tree yet), oldest first. */
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

/**
 * The saved collections as far as they're loaded, with a summary (`artistInfo`) of each artist whose albums and tracks
 * aren't loaded yet (they load when needed; state/remote.ts loadArtists). With no summary, an artist counts as loaded.
 */
export type Library = Persisted & { artistInfo?: Readonly<Record<string, ArtistInfo>> }

/** Whether an artist's albums and tracks are here. */
export const isLoaded = (s: Library, artistId: string) => !s.artistInfo?.[artistId]

/** An artist's score: worked out from their tracks once they're loaded, the database's until then. */
export const artistScoreOf = (s: Library, artistId: string): number | undefined => {
  const info = s.artistInfo?.[artistId]
  return info ? info.score : artistScore(tracksByArtist(s, artistId))
}

/** An artist's albums, oldest first by when they were added (empty until they're loaded). */
export const albumsOf = (s: Pick<Persisted, 'albums'>, artistId: string): Album[] =>
  Object.values(s.albums).filter(a => a.artistId === artistId).sort((a, b) => a.stagedAt - b.stagedAt)

/** Whether an artist has any albums (loaded or not). */
export const hasAlbums = (s: Library, artistId: string) => {
  const info = s.artistInfo?.[artistId]
  return info ? info.albums > 0 : albumsOf(s, artistId).length > 0
}

/**
 * When the first of an artist's albums went on the tree, leaving out albums taken off the rater in the catalog;
 * undefined if none is on it.
 */
export const firstOnTree = (s: Library, artistId: string, hidden: ReadonlySet<string> = new Set()): number | undefined => {
  const info = s.artistInfo?.[artistId]
  if (info) return info.firstAdded
  const added = albumsOf(s, artistId).filter(a => a.addedAt !== undefined && !hidden.has(a.id)).map(a => a.addedAt!)
  return added.length ? Math.min(...added) : undefined
}

/** How many things are on a type's tree, counting the tracks of artists not loaded yet. */
export const fruitCount = (s: Library, type: TypeId) => treeNodes(s, type).length
  + (type === 'music' && s.artistInfo ? Object.values(s.artistInfo).reduce((n, i) => n + i.fruit, 0) : 0)

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

/** A score as shown, on the scale in use (shared/scale.ts); artist scores (open-ended) to one decimal. */
export const formatScore = (score: number) => formatOnScale(score)

/** A song's tier, by its score as shown (rounded to the scale's step), so the number and the tier name beside it always agree. */
export const songTier = (score: number) => tierOf(TRACK_TIERS, roundToShown(score))!
export const formatArtistScore = (score: number) => score.toFixed(1)
/** An album's rating label while some of its songs are unrated (shown as Incomplete). */
export const INCOMPLETE = 'INCOMPLETE'

/** An album's score (the average of its rated songs) on the scale in use, to up to two decimals: 3.57, 3.5, 4. */
export const formatAlbumScore = (score: number) => formatPrecise(score)
/** An album's letter grade, by its score as shown (grades' bounds are 0–100), so the two always agree. */
export const albumGrade = (score: number) => tierOf(ALBUM_GRADES, toStored(Number(formatAlbumScore(score))))!

/** How something's rating reads in the UI: its own score, its tracks' (albums, artists), or UNRATED; with its tier
 * (a track's song tier, an album's or artist's letter grade) on MUSIC. Tiers go by the score as shown, so the
 * number and the tier beside it always agree. */
export const rating = (s: Library, id: string): { label: string, tier?: Tier } => {
  const f = find(s, id)
  const unrated = { label: 'UNRATED' }
  if (!f) return unrated
  if (f.collection === 'albums') {
    // Misc has no album score or grade of its own.
    if (f.entity.misc) return { label: '' }
    const tracks = tracksOf(s, id)
    // Songs still to rate: no score or grade until they're all rated.
    if (isIncomplete(tracks)) return { label: INCOMPLETE }
    const v = albumScore(tracks)
    return v === undefined ? unrated : { label: formatAlbumScore(v), tier: albumGrade(v) }
  }
  if (f.collection === 'artists') {
    const v = artistScoreOf(s, id)
    return v === undefined ? unrated : { label: formatArtistScore(v), tier: tierOf(ARTIST_GRADES, Number(formatArtistScore(v))) }
  }
  // Not a song (a skit…): no score or tier.
  if (f.collection === 'tracks' && f.entity.notASong) return { label: 'NOT A SONG' }
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

/** How far (in stored 0–100 points, either way; one step on the 0–5 scale) a rated item's score may be from the one being dragged to and still be offered. */
export const SAME_SCORE_RANGE = 2

/**
 * Already-rated items of a type whose score is the same as `score` (as shown, rounded), or the nearest within
 * SAME_SCORE_RANGE: closest first, then most recently put on the tree. Hidden tracks count (their score was kept).
 * Used while a song is held still mid-drag, to compare it with songs already at that height.
 */
export const sameScore = (s: Persisted, type: TypeId, score: number, excludeId: string, limit = 5): (Track | Simple)[] => {
  const target = roundToShown(score)
  const all = Object.values(s[rateableCollection(type)]) as (Track | Simple)[]
  return all
    .filter(e => e.id !== excludeId && e.score !== undefined && !(e as Track).notASong && Math.abs(roundToShown(e.score) - target) <= SAME_SCORE_RANGE)
    .sort(nearestFirst(score))
    .slice(0, limit)
}

/** sameScore's order: closest to `score` (as shown) first, then the most recently put on the tree. */
export const nearestFirst = (score: number) => {
  const target = roundToShown(score)
  return (a: Rateable, b: Rateable) => Math.abs(roundToShown(a.score!) - target) - Math.abs(roundToShown(b.score!) - target) || (b.since ?? 0) - (a.since ?? 0)
}
