import type { Sql, TransactionSql } from 'postgres'
import { type Album, type Artist, type ArtistInfo, type ArtistLibrary, ARTIST_PAGE, type ArtistPage, type ArtistQuery, type Branch, type MusicCounts, type NearTrack, type Persisted, type Simple, type StartState, type Track, type VendorRef } from '../src/shared/model'
import type { Changes } from '../src/shared/sync'

/** Copies the non-null fields onto `out`. */
const defined = <T extends object>(out: T, fields: Record<string, unknown>): T => {
  for (const [k, v] of Object.entries(fields)) if (v !== null && v !== undefined) (out as Record<string, unknown>)[k] = v
  return out
}

type BaseRow = { id: string, name: string, image: string | null, colors: string[] | null }
type VendorRow = { vendor: string | null, vendor_id: string | null }
type TreeRow = { score: number | null, tree_angle: number | null, tree_length: number | null, tree_ring: number | null, tree_since: number | null, hidden: boolean }
type AlbumRow = BaseRow & VendorRow & { artist_id: string | null, year: number | null, tracklist_loaded: boolean, staged_at: number, added_at: number | null, misc: boolean }
type TrackRow = BaseRow & VendorRow & TreeRow & {
  album_id: string | null, artist_id: string | null, disc: number | null, number: number | null, duration_ms: number | null, not_a_song: boolean, live: boolean, short_title: string | null,
}

const vendorOf = (r: VendorRow): VendorRef | undefined => r.vendor && r.vendor_id ? { name: r.vendor as VendorRef['name'], id: r.vendor_id } : undefined
const branchOf = (r: TreeRow): Branch | undefined =>
  r.tree_angle !== null && r.tree_length !== null && r.tree_ring !== null ? { angle: r.tree_angle, length: r.tree_length, ring: r.tree_ring } : undefined
const base = (r: BaseRow) => defined({ id: r.id, name: r.name } as { id: string, name: string }, { image: r.image, colors: r.colors })
const tree = (r: TreeRow) => ({ score: r.score, branch: branchOf(r), since: r.tree_since, hidden: r.hidden || null })

const byId = <T extends { id: string }>(rows: T[]) => Object.fromEntries(rows.map(r => [r.id, r]))

const TREE_COLS = 'score, tree_angle, tree_length, tree_ring, tree_since::double precision as tree_since, hidden'

const ALBUM_COLS = `a.id, a.name, a.image, a.colors, a.vendor, a.vendor_id, a.artist_id, a.year, a.tracklist_loaded,
  a.staged_at::double precision as staged_at, a.added_at::double precision as added_at, a.misc`
const TRACK_COLS = `t.id, t.name, t.image, t.colors, t.vendor, t.vendor_id, t.album_id, t.artist_id, t.disc, t.number, t.duration_ms,
  t.not_a_song, t.live, t.short_title, t.score, t.tree_angle, t.tree_length, t.tree_ring, t.tree_since::double precision as tree_since, t.hidden`

const artistOf = (r: BaseRow & VendorRow) => defined(base(r) as Artist, { vendor: vendorOf(r) })
const albumOf = (r: AlbumRow) => defined({ ...base(r), tracklistLoaded: r.tracklist_loaded, stagedAt: r.staged_at } as Album, {
  vendor: vendorOf(r), artistId: r.artist_id, year: r.year, addedAt: r.added_at, misc: r.misc || null,
})
const trackOf = (r: TrackRow) => defined(base(r) as Track, {
  vendor: vendorOf(r), albumId: r.album_id, artistId: r.artist_id, disc: r.disc, number: r.number, durationMs: r.duration_ms,
  notASong: r.not_a_song || null, live: r.live || null, shortTitle: r.short_title, ...tree(r),
})
const simpleOf = (r: BaseRow & TreeRow) => defined(base(r) as Simple, tree(r))

const loadSimple = (sql: Sql) => Promise.all([
  sql.unsafe<(BaseRow & TreeRow)[]>(`select id, name, image, colors, ${TREE_COLS} from movies`),
  sql.unsafe<(BaseRow & TreeRow)[]>(`select id, name, image, colors, ${TREE_COLS} from books`),
])

/** Everything saved, in the shape the app keeps it (tests; the app itself starts from loadStart). */
export const loadState = async (sql: Sql): Promise<Persisted> => {
  const [artists, albums, tracks, [movies, books]] = await Promise.all([
    sql<(BaseRow & VendorRow)[]>`select id, name, image, colors, vendor, vendor_id from music_artists`,
    sql.unsafe<AlbumRow[]>(`select ${ALBUM_COLS} from music_albums a`),
    sql.unsafe<TrackRow[]>(`select ${TRACK_COLS} from music_tracks t`),
    loadSimple(sql),
  ])
  return {
    artists: byId(artists.map(artistOf)), albums: byId(albums.map(albumOf)), tracks: byId(tracks.map(trackOf)),
    movies: byId(movies.map(simpleOf)), books: byId(books.map(simpleOf)),
  }
}

/** The artist a track belongs to: its own, or its album's. */
const TRACK_ARTIST = 'coalesce(t.artist_id, (select a.artist_id from music_albums a where a.id = t.album_id))'

type SummaryRow = BaseRow & VendorRow & { score: string | null, albums: number, first_added: number | null, fruit: number,
  k_null: boolean, k_score: string, k_name: string }

/**
 * Artists with a summary of each (ArtistInfo), and their place in the catalog's order: best first by artist score,
 * unrated ones after, then by name (k_*: the sort key, for paging).
 */
const ARTIST_SUMMARY = `
  select ar.id, ar.name, ar.image, ar.colors, ar.vendor, ar.vendor_id, s.score,
    (select count(*)::int from music_albums a where a.artist_id = ar.id) as albums,
    (select min(a.added_at)::double precision from music_albums a where a.artist_id = ar.id) as first_added,
    (select count(*)::int from music_tracks t where ${TRACK_ARTIST} = ar.id and t.tree_angle is not null and not t.hidden and not t.not_a_song) as fruit,
    (s.score is null) as k_null, (-coalesce(s.score, 0))::text as k_score, lower(ar.name) as k_name
  from music_artists ar left join music_artist_scores s on s.artist_id = ar.id`
const ARTIST_ORDER = '(s.score is null), -coalesce(s.score, 0), lower(ar.name), ar.id'

const summariesOf = (rows: SummaryRow[]): Omit<ArtistPage, 'next'> => ({
  artists: byId(rows.map(artistOf)),
  artistInfo: Object.fromEntries(rows.map(r => [r.id, defined({ albums: r.albums, fruit: r.fruit } as ArtistInfo, {
    score: r.score === null ? null : Number(r.score), firstAdded: r.first_added,
  })])),
})

/** Where a page of artists starts: the sort key of the last one before it. */
type Cursor = [unrated: boolean, negScore: string, name: string, id: string]
const encodeCursor = (r: SummaryRow) => Buffer.from(JSON.stringify([r.k_null, r.k_score, r.k_name, r.id] satisfies Cursor)).toString('base64url')
/** A cursor from a request, or undefined if it isn't one of ours. */
export const decodeCursor = (raw: string): Cursor | undefined => {
  try {
    const c = JSON.parse(Buffer.from(raw, 'base64url').toString()) as unknown
    return Array.isArray(c) && c.length === 4 && typeof c[0] === 'boolean' && typeof c[1] === 'string' && /^-?\d+(\.\d+)?$/.test(c[1])
      && typeof c[2] === 'string' && typeof c[3] === 'string' && /^[0-9a-f-]{36}$/i.test(c[3]) ? c as Cursor : undefined
  } catch { return undefined }
}

/**
 * A page of artists in the catalog's order, after `after` (from the start if null). Keyset paging: an artist whose
 * score changed since an earlier page may come again (the app keeps the one it has), but none is skipped, since
 * only loaded artists' scores change.
 */
export const loadArtistPage = async (sql: Sql, after: Cursor | null, limit = ARTIST_PAGE): Promise<ArtistPage> => {
  const rows = after
    ? await sql.unsafe<SummaryRow[]>(`${ARTIST_SUMMARY} where (${ARTIST_ORDER}) > ($1::boolean, $2::numeric, $3::text, $4::uuid) order by ${ARTIST_ORDER} limit $5`, [...after, limit + 1])
    : await sql.unsafe<SummaryRow[]>(`${ARTIST_SUMMARY} order by ${ARTIST_ORDER} limit $1`, [limit + 1])
  const page = rows.slice(0, limit)
  return { ...summariesOf(page), next: rows.length > limit ? encodeCursor(page.at(-1)!) : null }
}

/** Most artists one find returns. */
const MAX_FOUND = 50

/** Artists by Spotify id, by exact name (any case), or whose name contains `q`, with a summary of each. */
export const findArtists = async (sql: Sql, { vendorIds = [], names = [], q }: ArtistQuery): Promise<Omit<ArtistPage, 'next'>> => {
  const like = q ? `%${q.replace(/[\\%_]/g, m => `\\${m}`)}%` : null
  const rows = await sql.unsafe<SummaryRow[]>(`${ARTIST_SUMMARY}
    where (ar.vendor = 'spotify' and ar.vendor_id = any($1::text[])) or lower(ar.name) = any($2::text[]) or ($3::text is not null and ar.name ilike $3)
    order by ${ARTIST_ORDER} limit ${MAX_FOUND}`, [vendorIds, names.map(n => n.toLowerCase()), like])
  return summariesOf(rows)
}

/**
 * What the app starts with (StartState): the first page of artists (the rest come as the catalog scrolls, or when
 * something looks one up), movies and books, and only the albums and tracks that belong to no artist. An artist's own
 * albums and tracks come later, from loadArtists.
 */
export const loadStart = async (sql: Sql): Promise<StartState> => {
  const [page, albums, tracks, [movies, books]] = await Promise.all([
    loadArtistPage(sql, null),
    sql.unsafe<AlbumRow[]>(`select ${ALBUM_COLS} from music_albums a where a.artist_id is null`),
    sql.unsafe<TrackRow[]>(`select ${TRACK_COLS} from music_tracks t where ${TRACK_ARTIST} is null`),
    loadSimple(sql),
  ])
  return {
    ...page, albums: byId(albums.map(albumOf)), tracks: byId(tracks.map(trackOf)),
    movies: byId(movies.map(simpleOf)), books: byId(books.map(simpleOf)),
  }
}

/** Some artists' albums, and every track on those albums or credited to those artists. */
export const loadArtists = async (sql: Sql, ids: string[]): Promise<ArtistLibrary> => {
  const [albums, tracks] = await Promise.all([
    sql.unsafe<AlbumRow[]>(`select ${ALBUM_COLS} from music_albums a where a.artist_id = any($1::uuid[])`, [ids]),
    sql.unsafe<TrackRow[]>(`select ${TRACK_COLS} from music_tracks t where ${TRACK_ARTIST} = any($1::uuid[])`, [ids]),
  ])
  return { albums: byId(albums.map(albumOf)), tracks: byId(tracks.map(trackOf)) }
}

/**
 * Rated tracks whose score, rounded, is within `range` of `score`: closest first, then the most recently put on the
 * tree, at most `limit` (the same as state/board.ts sameScore, over the whole database). Hidden ones count.
 */
/** How many artists, albums (Misc aside: it holds an artist's loose songs) and songs (not-a-song tracks aside) the database holds. */
export const loadCounts = async (sql: Sql): Promise<MusicCounts> => {
  const [r] = await sql<{ artists: number, albums: number, songs: number }[]>`
    select (select count(*)::int from music_artists) as artists,
      (select count(*)::int from music_albums where not misc) as albums,
      (select count(*)::int from music_tracks where not not_a_song) as songs`
  return { artists: r.artists, albums: r.albums, songs: r.songs }
}

export const loadNear = async (sql: Sql, score: number, range: number, exclude: string[], limit: number): Promise<NearTrack[]> => {
  const rows = await sql.unsafe<(TrackRow & { album_name: string | null, artist_name: string | null })[]>(`
    select ${TRACK_COLS}, al.name as album_name, ar.name as artist_name
    from music_tracks t left join music_albums al on al.id = t.album_id left join music_artists ar on ar.id = ${TRACK_ARTIST}
    where t.score is not null and not t.not_a_song and abs(floor(t.score + 0.5) - $1) <= $2 and not (t.id = any($3::uuid[]))
    order by abs(floor(t.score + 0.5) - $1), t.tree_since desc nulls last
    limit $4`, [Math.round(score), range, exclude, limit])
  return rows.map(r => defined(trackOf(r) as NearTrack, { albumName: r.album_name, artistName: r.artist_name }))
}

const treeValues = (e: Track | Simple) => ({
  score: e.score ?? null, tree_angle: e.branch?.angle ?? null, tree_length: e.branch?.length ?? null,
  tree_ring: e.branch?.ring ?? null, tree_since: e.since ?? null, hidden: e.hidden ?? false,
})

const upsertSimple = async (tx: TransactionSql, table: 'movies' | 'books', e: Simple) => {
  const t = treeValues(e)
  await tx`insert into ${tx(table)} (id, name, image, colors, score, tree_angle, tree_length, tree_ring, tree_since, hidden)
    values (${e.id}, ${e.name}, ${e.image ?? null}, ${e.colors ?? null}, ${t.score}, ${t.tree_angle}, ${t.tree_length}, ${t.tree_ring}, ${t.tree_since}, ${t.hidden})
    on conflict (id) do update set name = excluded.name, image = excluded.image, colors = excluded.colors, score = excluded.score,
      tree_angle = excluded.tree_angle, tree_length = excluded.tree_length, tree_ring = excluded.tree_ring,
      tree_since = excluded.tree_since, hidden = excluded.hidden`
}

/**
 * Applies a batch of saves in one transaction: upserts in dependency order (artists, albums, tracks, then movies
 * and books), then deletes in reverse. Links (track → album, album/track → artist) are checked at commit, so a batch
 * can create an artist, an album and its tracks together, in any order.
 */
export const applyChanges = async (sql: Sql, c: Changes): Promise<void> => {
  await sql.begin(async tx => {
    for (const a of c.upsert.artists) {
      await tx`insert into music_artists (id, name, image, colors, vendor, vendor_id)
        values (${a.id}, ${a.name}, ${a.image ?? null}, ${a.colors ?? null}, ${a.vendor?.name ?? null}, ${a.vendor?.id ?? null})
        on conflict (id) do update set name = excluded.name, image = excluded.image, colors = excluded.colors,
          vendor = excluded.vendor, vendor_id = excluded.vendor_id`
    }
    for (const a of c.upsert.albums) {
      await tx`insert into music_albums (id, name, image, colors, vendor, vendor_id, artist_id, year, tracklist_loaded, staged_at, added_at, misc)
        values (${a.id}, ${a.name}, ${a.image ?? null}, ${a.colors ?? null}, ${a.vendor?.name ?? null}, ${a.vendor?.id ?? null},
                ${a.artistId ?? null}, ${a.year ?? null}, ${a.tracklistLoaded}, ${a.stagedAt}, ${a.addedAt ?? null}, ${a.misc ?? false})
        on conflict (id) do update set name = excluded.name, image = excluded.image, colors = excluded.colors, vendor = excluded.vendor,
          vendor_id = excluded.vendor_id, artist_id = excluded.artist_id, year = excluded.year, tracklist_loaded = excluded.tracklist_loaded,
          staged_at = excluded.staged_at, added_at = excluded.added_at, misc = excluded.misc`
    }
    for (const r of c.upsert.tracks) {
      const t = treeValues(r)
      await tx`insert into music_tracks (id, name, image, colors, vendor, vendor_id, album_id, artist_id, disc, number, duration_ms,
                                         not_a_song, live, short_title, score, tree_angle, tree_length, tree_ring, tree_since, hidden)
        values (${r.id}, ${r.name}, ${r.image ?? null}, ${r.colors ?? null}, ${r.vendor?.name ?? null}, ${r.vendor?.id ?? null},
                ${r.albumId ?? null}, ${r.artistId ?? null}, ${r.disc ?? null}, ${r.number ?? null}, ${r.durationMs ?? null},
                ${r.notASong ?? false}, ${r.live ?? false}, ${r.shortTitle ?? null}, ${t.score}, ${t.tree_angle}, ${t.tree_length}, ${t.tree_ring}, ${t.tree_since}, ${t.hidden})
        on conflict (id) do update set name = excluded.name, image = excluded.image, colors = excluded.colors, vendor = excluded.vendor,
          vendor_id = excluded.vendor_id, album_id = excluded.album_id, artist_id = excluded.artist_id, disc = excluded.disc,
          number = excluded.number, duration_ms = excluded.duration_ms, not_a_song = excluded.not_a_song, live = excluded.live,
          short_title = excluded.short_title,
          score = excluded.score, tree_angle = excluded.tree_angle, tree_length = excluded.tree_length, tree_ring = excluded.tree_ring,
          tree_since = excluded.tree_since, hidden = excluded.hidden`
    }
    for (const m of c.upsert.movies) await upsertSimple(tx, 'movies', m)
    for (const b of c.upsert.books) await upsertSimple(tx, 'books', b)

    if (c.remove.tracks.length) await tx`delete from music_tracks where id in ${tx(c.remove.tracks)}`
    if (c.remove.albums.length) await tx`delete from music_albums where id in ${tx(c.remove.albums)}`
    if (c.remove.artists.length) await tx`delete from music_artists where id in ${tx(c.remove.artists)}`
    if (c.remove.movies.length) await tx`delete from movies where id in ${tx(c.remove.movies)}`
    if (c.remove.books.length) await tx`delete from books where id in ${tx(c.remove.books)}`
  })
}

/** Album and artist scores straight from the database views (for checking the app against SQL). */
export const loadScores = async (sql: Sql) => {
  const [albums, artists] = await Promise.all([
    sql<{ album_id: string, score: number | null }[]>`select album_id, score from music_album_scores`,
    sql<{ artist_id: string, score: string | null }[]>`select artist_id, score from music_artist_scores`,
  ])
  return {
    albums: Object.fromEntries(albums.map(r => [r.album_id, r.score])),
    artists: Object.fromEntries(artists.map(r => [r.artist_id, r.score === null ? null : Number(r.score)])),
  }
}
