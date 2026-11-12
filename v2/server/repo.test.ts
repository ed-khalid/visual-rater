import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { emptyPersisted, type Persisted } from '../src/shared/model'
import { diffState, emptyChanges, everything } from '../src/shared/sync'
import { migrate } from './migrate'
import { applyChanges, decodeCursor, findArtists, loadArtistPage, loadArtists, loadCounts, loadNear, loadScores, loadStart, loadState } from './repo'

/**
 * Runs against a real Postgres when V2_TEST_DATABASE_URL is set (e.g. the visual_rater_v2 database), each suite in
 * a throwaway schema that's dropped afterwards, so the database's own tables are never touched. Skipped otherwise.
 */
const url = process.env.V2_TEST_DATABASE_URL
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

const throwaway = () => {
  const schema = `test_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
  let admin: postgres.Sql
  const ctx = { sql: undefined as unknown as postgres.Sql }
  beforeAll(async () => {
    admin = postgres(url!, { max: 1, onnotice: () => {} })
    await admin.unsafe(`create schema ${schema}`)
    ctx.sql = postgres(url!, { max: 2, onnotice: () => {}, connection: { search_path: schema } })
  })
  afterAll(async () => {
    await ctx.sql?.end()
    await admin?.unsafe(`drop schema if exists ${schema} cascade`)
    await admin?.end()
  })
  return ctx
}

describe.skipIf(!url)('Postgres repository (real database)', () => {
  const db = throwaway()
  const state = (): Persisted => ({
    ...emptyPersisted(),
    artists: { [id(1)]: { id: id(1), name: 'Radiohead', vendor: { name: 'spotify', id: 'rh' } } },
    albums: { [id(2)]: { id: id(2), name: 'Kid A', image: 'https://i.scdn.co/image/x', colors: ['#45372c'], vendor: { name: 'spotify', id: 'kida' },
      artistId: id(1), year: 2000, tracklistLoaded: true, stagedAt: 1730000000001, addedAt: 1730000000002 },
      [id(8)]: { id: id(8), name: 'Misc', artistId: id(1), tracklistLoaded: true, stagedAt: 1730000000004, addedAt: 1730000000004, misc: true } },
    tracks: {
      [id(3)]: { id: id(3), name: 'Idioteque', shortTitle: 'Idioteque', albumId: id(2), artistId: id(1), disc: 1, number: 8, durationMs: 309000, vendor: { name: 'spotify', id: 't8' },
        score: 96, branch: { angle: Math.PI / 2, length: 1.35, ring: 0 }, since: 1730000000003 },
      [id(4)]: { id: id(4), name: 'Treefingers', albumId: id(2), artistId: id(1), disc: 1, number: 5, notASong: true, score: 99 },
      [id(5)]: { id: id(5), name: 'Morning Bell', albumId: id(2), artistId: id(1), disc: 1, number: 9, score: 82, hidden: true, live: true },
    },
    movies: { [id(6)]: { id: id(6), name: 'Stalker', score: 90, branch: { angle: 0, length: 1.25, ring: 1 }, since: 5 } },
    books: {},
  })

  test('the schema applies once, and has exactly the tables and views planned', async () => {
    expect(await migrate(db.sql)).toEqual(['001.schema.sql', '002.track_short_title.sql', '003.misc_album.sql', '004.misc_album_singles.sql', '005.artist_points_by_tier.sql', '006.not_a_song.sql', '007.live_tracks.sql'])
    expect(await migrate(db.sql)).toEqual([])
    const tables = await db.sql<{ t: string }[]>`select table_name as t from information_schema.tables where table_schema = current_schema() order by 1`
    expect(tables.map(r => r.t)).toEqual(['books', 'movies', 'music_album_scores', 'music_albums', 'music_artist_scores', 'music_artists', 'music_tracks', 'schema_migrations'])
  })

  test('counts every artist, album (Misc aside) and song saved', async () => {
    await applyChanges(db.sql, everything(state()))
    expect(await loadCounts(db.sql)).toEqual({ artists: 1, albums: 1, songs: 2 }) // Treefingers isn't a song
  })

  test('everything written reads back exactly', async () => {
    await applyChanges(db.sql, everything(state()))
    expect(await loadState(db.sql)).toEqual(state())
  })

  test('the score views follow the v1 formulas (hidden tracks count, excluded ones don\'t count for the artist)', async () => {
    const scores = await loadScores(db.sql)
    expect(scores.albums[id(2)]).toBeCloseTo((96 + 82) / 2) // Treefingers isn't a song
    expect(scores.artists[id(1)]).toBe(6) // 96 → 6; 82 is live (counts for the album only); 99 isn't a song
  })

  test('the app starts with artists and their summaries; their albums and tracks load per artist', async () => {
    const single = emptyChanges()
    single.upsert.tracks.push({ id: id(7), name: 'Typed in', score: 50, branch: { angle: 0, length: 1, ring: 0 }, since: 9 })
    await applyChanges(db.sql, single)
    const start = await loadStart(db.sql)
    expect(start.artists).toEqual(state().artists)
    expect(start.albums).toEqual({})
    expect(Object.keys(start.tracks)).toEqual([id(7)]) // belongs to no artist
    expect(start.movies).toEqual(state().movies)
    // 7 points; one album, on the tree since …02; one track on the tree and not hidden
    expect(start.artistInfo).toEqual({ [id(1)]: { score: 6, albums: 2, firstAdded: 1730000000002, fruit: 1 } })
    expect(start.next).toBeNull() // one artist: one page
    expect(await loadArtists(db.sql, [id(1)])).toEqual({ albums: state().albums, tracks: state().tracks })
    expect(await loadArtists(db.sql, [id(99)])).toEqual({ albums: {}, tracks: {} })
    const near = await loadNear(db.sql, 97, 2, [id(4)], 5)
    expect(near.map(t => t.id)).toEqual([id(3)]) // 96; Treefingers (99) is excluded, and isn't a song anyway
    expect(near[0]).toMatchObject({ albumName: 'Kid A', artistName: 'Radiohead' })
    expect((await loadNear(db.sql, 97, 2, [], 5)).map(t => t.id)).toEqual([id(3)]) // Treefingers (99) isn't a song
    const c = emptyChanges(); c.remove.tracks.push(id(7)); await applyChanges(db.sql, c)
  })

  test('edits and removals made as diffs are saved', async () => {
    const before = await loadState(db.sql)
    const next: Persisted = { ...before, tracks: { ...before.tracks, [id(3)]: { ...before.tracks[id(3)], score: 91, branch: { angle: 0, length: 2, ring: 0 } } }, movies: {} }
    await applyChanges(db.sql, diffState(before, next))
    const after = await loadState(db.sql)
    expect(after.tracks[id(3)]).toMatchObject({ score: 91, branch: { length: 2 } })
    expect(after.movies).toEqual({})
  })

  test('deleting an album deletes its tracks; deleting an artist unlinks them', async () => {
    const c = emptyChanges()
    c.remove.albums.push(id(2))
    await applyChanges(db.sql, c)
    const after = await loadState(db.sql)
    expect(Object.keys(after.albums)).toEqual([id(8)]) // Misc stays
    expect(after.tracks).toEqual({})
    expect(after.artists[id(1)]).toBeDefined()
  })

  test('an album and its tracks can be saved in either order in one batch (links are checked at commit)', async () => {
    const c = emptyChanges()
    c.upsert.tracks.push({ id: id(11), name: 'Airbag', albumId: id(10), artistId: id(1) })
    c.upsert.albums.push({ id: id(10), name: 'OK Computer', artistId: id(1), tracklistLoaded: true, stagedAt: 1 })
    await applyChanges(db.sql, c)
    expect((await loadState(db.sql)).tracks[id(11)].albumId).toBe(id(10))
  })

  test('an artist has one Misc album at most', async () => {
    const c = emptyChanges()
    c.upsert.albums.push({ id: id(30), name: 'Misc', artistId: id(1), tracklistLoaded: true, stagedAt: 2, misc: true })
    await expect(applyChanges(db.sql, c)).rejects.toThrow()
  })

  test('the database itself rejects impossible rows, and a failed batch changes nothing', async () => {
    const before = await loadState(db.sql)
    const bad = emptyChanges()
    bad.upsert.movies.push({ id: id(20), name: 'fine' })
    bad.upsert.tracks.push({ id: id(21), name: 'orphan', albumId: id(99) }) // no such album
    await expect(applyChanges(db.sql, bad)).rejects.toThrow()
    expect(await loadState(db.sql)).toEqual(before)
  })
})

describe.skipIf(!url)('artists a page at a time (real database)', () => {
  const db = throwaway()
  // Five artists: scores from one rated track each (CLASSIC 6, GREAT 4, GOOD 1, another CLASSIC 6), one unrated.
  const scored: [number, string, number | undefined][] = [[41, 'Beta', 96], [42, 'alpha', 96], [43, 'Gamma', 92], [44, 'Delta', 82], [45, 'Echo', undefined]]
  beforeAll(async () => {
    await migrate(db.sql)
    const c = emptyChanges()
    for (const [n, name, score] of scored) {
      c.upsert.artists.push({ id: id(n), name, ...(n === 43 ? { vendor: { name: 'spotify' as const, id: '4Z8W4fKeB5YxbusRsdQVPb' } } : {}) })
      c.upsert.albums.push({ id: id(n + 100), name: `${name} LP`, artistId: id(n), tracklistLoaded: true, stagedAt: n, addedAt: n })
      c.upsert.tracks.push({ id: id(n + 200), name: 'Song', albumId: id(n + 100), artistId: id(n), branch: { angle: 0, length: 1, ring: 0 }, ...(score !== undefined ? { score } : {}) })
    }
    await applyChanges(db.sql, c)
  })

  test('pages run best first by artist score (ties by name, any case), unrated last, none skipped or repeated', async () => {
    const names: string[] = []
    let page = await loadArtistPage(db.sql, null, 2)
    for (;;) {
      names.push(...Object.values(page.artists).map(a => a.name))
      expect(Object.keys(page.artistInfo).sort()).toEqual(Object.keys(page.artists).sort())
      if (!page.next) break
      page = await loadArtistPage(db.sql, decodeCursor(page.next)!, 2)
    }
    expect(names).toEqual(['alpha', 'Beta', 'Gamma', 'Delta', 'Echo'])
    expect((await loadArtistPage(db.sql, null, 5)).next).toBeNull()
    expect((await loadArtistPage(db.sql, null, 4)).next).not.toBeNull()
  })

  test('a page after an artist whose score changed since still has every artist after them', async () => {
    const first = await loadArtistPage(db.sql, null, 2) // alpha, Beta
    const c = emptyChanges() // alpha drops to the bottom of the rated ones
    c.upsert.tracks.push({ id: id(242), name: 'Song', albumId: id(142), artistId: id(42), branch: { angle: 0, length: 1, ring: 0 }, score: 60 })
    await applyChanges(db.sql, c)
    const rest = await loadArtistPage(db.sql, decodeCursor(first.next!)!, 10)
    expect(Object.values(rest.artists).map(a => a.name)).toEqual(['Gamma', 'Delta', 'alpha', 'Echo']) // alpha again; the app keeps its own
  })

  test('cursors that aren\'t ours are refused', () => {
    for (const bad of ['', 'nope', Buffer.from('[1,2,3,4]').toString('base64url'), Buffer.from('[true,"1;drop","x","y"]').toString('base64url')]) {
      expect(decodeCursor(bad)).toBeUndefined()
    }
  })

  test('lookups by Spotify id, by exact name in any case, or by part of a name (wildcards taken literally)', async () => {
    const names = async (q: Parameters<typeof findArtists>[1]) => Object.values((await findArtists(db.sql, q)).artists).map(a => a.name).sort()
    expect(await names({ vendorIds: ['4Z8W4fKeB5YxbusRsdQVPb'] })).toEqual(['Gamma'])
    expect(await names({ names: ['ALPHA', 'echo'] })).toEqual(['Echo', 'alpha'])
    expect(await names({ q: 'ta' })).toEqual(['Beta', 'Delta'])
    expect(await names({ q: '%' })).toEqual([])
    const found = await findArtists(db.sql, { names: ['Delta'] })
    expect(found.artistInfo[id(44)]).toEqual({ score: 1, albums: 1, firstAdded: 44, fruit: 1 })
  })
})
