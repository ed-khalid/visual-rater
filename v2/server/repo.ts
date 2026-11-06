import type { Sql, TransactionSql } from 'postgres'
import type { Album, Artist, Branch, Persisted, Simple, Track, VendorRef } from '../src/shared/model'
import type { Changes } from '../src/shared/sync'

/** Copies the non-null fields onto `out`. */
const defined = <T extends object>(out: T, fields: Record<string, unknown>): T => {
  for (const [k, v] of Object.entries(fields)) if (v !== null && v !== undefined) (out as Record<string, unknown>)[k] = v
  return out
}

type BaseRow = { id: string, name: string, image: string | null, colors: string[] | null }
type VendorRow = { vendor: string | null, vendor_id: string | null }
type TreeRow = { score: number | null, tree_angle: number | null, tree_length: number | null, tree_ring: number | null, tree_since: number | null, hidden: boolean }
type AlbumRow = BaseRow & VendorRow & { artist_id: string | null, year: number | null, tracklist_loaded: boolean, staged_at: number, added_at: number | null }
type TrackRow = BaseRow & VendorRow & TreeRow & {
  album_id: string | null, artist_id: string | null, disc: number | null, number: number | null, duration_ms: number | null, exclude_from_artist_score: boolean,
}

const vendorOf = (r: VendorRow): VendorRef | undefined => r.vendor && r.vendor_id ? { name: r.vendor as VendorRef['name'], id: r.vendor_id } : undefined
const branchOf = (r: TreeRow): Branch | undefined =>
  r.tree_angle !== null && r.tree_length !== null && r.tree_ring !== null ? { angle: r.tree_angle, length: r.tree_length, ring: r.tree_ring } : undefined
const base = (r: BaseRow) => defined({ id: r.id, name: r.name } as { id: string, name: string }, { image: r.image, colors: r.colors })
const tree = (r: TreeRow) => ({ score: r.score, branch: branchOf(r), since: r.tree_since, hidden: r.hidden || null })

const byId = <T extends { id: string }>(rows: T[]) => Object.fromEntries(rows.map(r => [r.id, r]))

const TREE_COLS = 'score, tree_angle, tree_length, tree_ring, tree_since::double precision as tree_since, hidden'

/** Everything saved, in the shape the app keeps it. */
export const loadState = async (sql: Sql): Promise<Persisted> => {
  const [artists, albums, tracks, movies, books] = await Promise.all([
    sql<(BaseRow & VendorRow)[]>`select id, name, image, colors, vendor, vendor_id from music_artists`,
    sql<AlbumRow[]>`select id, name, image, colors, vendor, vendor_id, artist_id, year, tracklist_loaded,
      staged_at::double precision as staged_at, added_at::double precision as added_at from music_albums`,
    sql.unsafe<TrackRow[]>(`select id, name, image, colors, vendor, vendor_id, album_id, artist_id, disc, number, duration_ms,
      exclude_from_artist_score, ${TREE_COLS} from music_tracks`),
    sql.unsafe<(BaseRow & TreeRow)[]>(`select id, name, image, colors, ${TREE_COLS} from movies`),
    sql.unsafe<(BaseRow & TreeRow)[]>(`select id, name, image, colors, ${TREE_COLS} from books`),
  ])
  return {
    artists: byId(artists.map(r => defined(base(r) as Artist, { vendor: vendorOf(r) }))),
    albums: byId(albums.map(r => defined({ ...base(r), tracklistLoaded: r.tracklist_loaded, stagedAt: r.staged_at } as Album, {
      vendor: vendorOf(r), artistId: r.artist_id, year: r.year, addedAt: r.added_at,
    }))),
    tracks: byId(tracks.map(r => defined(base(r) as Track, {
      vendor: vendorOf(r), albumId: r.album_id, artistId: r.artist_id, disc: r.disc, number: r.number, durationMs: r.duration_ms,
      excludeFromArtistScore: r.exclude_from_artist_score || null, ...tree(r),
    }))),
    movies: byId(movies.map(r => defined(base(r) as Simple, tree(r)))),
    books: byId(books.map(r => defined(base(r) as Simple, tree(r)))),
  }
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
      await tx`insert into music_albums (id, name, image, colors, vendor, vendor_id, artist_id, year, tracklist_loaded, staged_at, added_at)
        values (${a.id}, ${a.name}, ${a.image ?? null}, ${a.colors ?? null}, ${a.vendor?.name ?? null}, ${a.vendor?.id ?? null},
                ${a.artistId ?? null}, ${a.year ?? null}, ${a.tracklistLoaded}, ${a.stagedAt}, ${a.addedAt ?? null})
        on conflict (id) do update set name = excluded.name, image = excluded.image, colors = excluded.colors, vendor = excluded.vendor,
          vendor_id = excluded.vendor_id, artist_id = excluded.artist_id, year = excluded.year, tracklist_loaded = excluded.tracklist_loaded,
          staged_at = excluded.staged_at, added_at = excluded.added_at`
    }
    for (const r of c.upsert.tracks) {
      const t = treeValues(r)
      await tx`insert into music_tracks (id, name, image, colors, vendor, vendor_id, album_id, artist_id, disc, number, duration_ms,
                                         exclude_from_artist_score, score, tree_angle, tree_length, tree_ring, tree_since, hidden)
        values (${r.id}, ${r.name}, ${r.image ?? null}, ${r.colors ?? null}, ${r.vendor?.name ?? null}, ${r.vendor?.id ?? null},
                ${r.albumId ?? null}, ${r.artistId ?? null}, ${r.disc ?? null}, ${r.number ?? null}, ${r.durationMs ?? null},
                ${r.excludeFromArtistScore ?? false}, ${t.score}, ${t.tree_angle}, ${t.tree_length}, ${t.tree_ring}, ${t.tree_since}, ${t.hidden})
        on conflict (id) do update set name = excluded.name, image = excluded.image, colors = excluded.colors, vendor = excluded.vendor,
          vendor_id = excluded.vendor_id, album_id = excluded.album_id, artist_id = excluded.artist_id, disc = excluded.disc,
          number = excluded.number, duration_ms = excluded.duration_ms, exclude_from_artist_score = excluded.exclude_from_artist_score,
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
