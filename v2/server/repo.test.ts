import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { emptyPersisted, type Persisted } from '../src/shared/model'
import { diffState, emptyChanges, everything } from '../src/shared/sync'
import { migrate } from './migrate'
import { applyChanges, loadScores, loadState } from './repo'

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
      artistId: id(1), year: 2000, tracklistLoaded: true, stagedAt: 1730000000001, addedAt: 1730000000002 } },
    tracks: {
      [id(3)]: { id: id(3), name: 'Idioteque', albumId: id(2), artistId: id(1), disc: 1, number: 8, durationMs: 309000, vendor: { name: 'spotify', id: 't8' },
        score: 96, branch: { angle: Math.PI / 2, length: 1.35, ring: 0 }, since: 1730000000003 },
      [id(4)]: { id: id(4), name: 'Treefingers', albumId: id(2), artistId: id(1), disc: 1, number: 5, excludeFromArtistScore: true, score: 99 },
      [id(5)]: { id: id(5), name: 'Morning Bell', albumId: id(2), artistId: id(1), disc: 1, number: 9, score: 82, hidden: true },
    },
    movies: { [id(6)]: { id: id(6), name: 'Stalker', score: 90, branch: { angle: 0, length: 1.25, ring: 1 }, since: 5 } },
    books: {},
  })

  test('the schema applies once, and has exactly the tables and views planned', async () => {
    expect(await migrate(db.sql)).toEqual(['001.schema.sql'])
    expect(await migrate(db.sql)).toEqual([])
    const tables = await db.sql<{ t: string }[]>`select table_name as t from information_schema.tables where table_schema = current_schema() order by 1`
    expect(tables.map(r => r.t)).toEqual(['books', 'movies', 'music_album_scores', 'music_albums', 'music_artist_scores', 'music_artists', 'music_tracks', 'schema_migrations'])
  })

  test('everything written reads back exactly', async () => {
    await applyChanges(db.sql, everything(state()))
    expect(await loadState(db.sql)).toEqual(state())
  })

  test('the score views follow the v1 formulas (hidden tracks count, excluded ones don\'t count for the artist)', async () => {
    const scores = await loadScores(db.sql)
    expect(scores.albums[id(2)]).toBeCloseTo((96 + 99 + 82) / 3)
    expect(scores.artists[id(1)]).toBe(7) // 96 → 6, 82 → 1; 99 is excluded
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
    expect(after.albums).toEqual({})
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

  test('the database itself rejects impossible rows, and a failed batch changes nothing', async () => {
    const before = await loadState(db.sql)
    const bad = emptyChanges()
    bad.upsert.movies.push({ id: id(20), name: 'fine' })
    bad.upsert.tracks.push({ id: id(21), name: 'orphan', albumId: id(99) }) // no such album
    await expect(applyChanges(db.sql, bad)).rejects.toThrow()
    expect(await loadState(db.sql)).toEqual(before)
  })
})
