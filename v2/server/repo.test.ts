import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import type { Persisted } from '../src/shared/model'
import { diffState, emptyChanges, everything } from '../src/shared/sync'
import { migrate } from './migrate'
import { applyChanges, loadState } from './repo'

/**
 * Runs against a real Postgres when V2_TEST_DATABASE_URL is set (e.g. the visual_rater_v2 database), inside a
 * throwaway schema that's dropped afterwards, so the database's own tables are never touched. Skipped otherwise.
 */
const url = process.env.V2_TEST_DATABASE_URL
const schema = `test_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

const state = (): Persisted => ({
  types: { music: { id: 'music', name: 'MUSIC', builtIn: true }, movies: { id: 'movies', name: 'MOVIES', builtIn: true }, books: { id: 'books', name: 'BOOKS', builtIn: true } },
  boards: { [id(1)]: { id: id(1), typeId: 'music', name: 'MUSIC', axis: 'linear', bands: [] } },
  items: {
    [id(2)]: { id: id(2), typeId: 'music', name: 'Kid A', image: 'https://i.scdn.co/image/x', artist: 'Radiohead', year: 2000,
      source: { provider: 'spotify', kind: 'album', id: 'abc' }, tracks: [{ id: 't1', name: 'Idioteque', number: 1, disc: 1, durationMs: 309000 }] },
    [id(3)]: { id: id(3), typeId: 'music', name: 'Idioteque', image: 'https://i.scdn.co/image/x', artist: 'Radiohead', year: 2000, albumId: id(2),
      source: { provider: 'spotify', kind: 'track', id: 't1' } },
    [id(4)]: { id: id(4), typeId: 'music', name: 'OK Computer' },
  },
  staged: [{ boardId: id(1), itemId: id(4), stagedAt: 1730000000001 }],
  added: [{ boardId: id(1), itemId: id(2), stagedAt: 1730000000002 }],
  placements: [{ boardId: id(1), itemId: id(3), position: 0.73, placedAt: 1730000000003, angle: Math.PI / 2, length: 1.35, ring: 0 }],
})

describe.skipIf(!url)('Postgres repository (real database)', () => {
  let admin: postgres.Sql, sql: postgres.Sql
  beforeAll(async () => {
    admin = postgres(url!, { max: 1, onnotice: () => {} })
    await admin.unsafe(`create schema ${schema}`)
    sql = postgres(url!, { max: 2, onnotice: () => {}, connection: { search_path: schema } })
  })
  afterAll(async () => {
    await sql?.end()
    await admin?.unsafe(`drop schema if exists ${schema} cascade`)
    await admin?.end()
  })

  test('migrations apply once, and the built-in types are there', async () => {
    expect(await migrate(sql)).toEqual(['001.initial.sql'])
    expect(await migrate(sql)).toEqual([])
    expect(Object.keys((await loadState(sql)).types).sort()).toEqual(['books', 'movies', 'music'])
  })

  test('everything written reads back exactly', async () => {
    await applyChanges(sql, everything(state()))
    expect(await loadState(sql)).toEqual(state())
  })

  test('edits, moves and removals made as diffs are saved', async () => {
    const before = await loadState(sql)
    const next: Persisted = {
      ...before,
      items: { ...before.items, [id(2)]: { ...before.items[id(2)], name: 'Kid A (Remaster)', year: 2001 } },
      placements: [{ ...before.placements[0], position: 0.9, length: 2 }],
      staged: [],
    }
    delete (next.items as Record<string, unknown>)[id(4)]
    await applyChanges(sql, diffState(before, next))
    const after = await loadState(sql)
    expect(after.items[id(2)]).toMatchObject({ name: 'Kid A (Remaster)', year: 2001 })
    expect(after.placements[0]).toMatchObject({ position: 0.9, length: 2 })
    expect(after.items[id(4)]).toBeUndefined()
    expect(after.staged).toEqual([])
  })

  test('removing an album keeps its tracks (their album link is cleared)', async () => {
    const before = await loadState(sql)
    const next = { ...before, added: [], items: { ...before.items } }
    delete next.items[id(2)]
    await applyChanges(sql, diffState(before, next))
    const after = await loadState(sql)
    expect(after.items[id(3)]).toBeDefined()
    expect(after.items[id(3)].albumId).toBeUndefined()
    expect(after.placements).toHaveLength(1)
  })

  test('a track can be saved before its album in the same batch (links are checked at commit)', async () => {
    const c = emptyChanges()
    c.upsert.items.push({ id: id(11), typeId: 'music', name: 'Airbag', albumId: id(10) }, { id: id(10), typeId: 'music', name: 'OK Computer' })
    await applyChanges(sql, c)
    expect((await loadState(sql)).items[id(11)].albumId).toBe(id(10))
  })

  test('the database itself rejects impossible rows, and a failed batch changes nothing', async () => {
    const before = await loadState(sql)
    const bad = emptyChanges()
    bad.upsert.items.push({ id: id(20), typeId: 'music', name: 'fine' })
    bad.upsert.boardItems.push({ boardId: id(1), itemId: id(20), status: 'placed', since: 1 }) // placed without a branch
    await expect(applyChanges(sql, bad)).rejects.toThrow()
    expect(await loadState(sql)).toEqual(before)
  })
})
