import { cp, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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
    [id(2)]: { id: id(2), typeId: 'music', name: 'Kid A', image: 'https://i.scdn.co/image/x', colors: ['#e05252', '#dfe8f0'],
      music: { kind: 'album', vendor: { name: 'spotify', id: 'abc' }, artistId: id(5), year: 2000, tracklistLoaded: true } },
    [id(3)]: { id: id(3), typeId: 'music', name: 'Idioteque', image: 'https://i.scdn.co/image/x',
      music: { kind: 'track', vendor: { name: 'spotify', id: 't1' }, albumId: id(2), artistId: id(5), disc: 1, number: 1, durationMs: 309000 } },
    [id(4)]: { id: id(4), typeId: 'music', name: 'OK Computer' },
    [id(5)]: { id: id(5), typeId: 'music', name: 'Radiohead', music: { kind: 'artist', vendor: { name: 'spotify', id: 'rh' } } },
    // a track that isn't on the board (only in the album's tracklist), with no vendor id
    [id(6)]: { id: id(6), typeId: 'music', name: 'Untitled', music: { kind: 'track', albumId: id(2), artistId: id(5), disc: 1, number: 2 } },
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
    expect(await migrate(sql)).toEqual(['001.initial.sql', '002.colors-are-raw-dominant.sql', '003.music-tables.sql'])
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
      items: { ...before.items, [id(2)]: { ...before.items[id(2)], name: 'Kid A (Remaster)', music: { kind: 'album', tracklistLoaded: true, year: 2001 } } },
      placements: [{ ...before.placements[0], position: 0.9, length: 2 }],
      staged: [],
    }
    delete (next.items as Record<string, unknown>)[id(4)]
    await applyChanges(sql, diffState(before, next))
    const after = await loadState(sql)
    expect(after.items[id(2)]).toEqual({ ...next.items[id(2)] }) // vendor and artist cleared too
    expect(after.placements[0]).toMatchObject({ position: 0.9, length: 2 })
    expect(after.items[id(4)]).toBeUndefined()
    expect(after.staged).toEqual([])
  })

  test('removing an album keeps its tracks (their album link is cleared); removing an artist clears links to it', async () => {
    const before = await loadState(sql)
    const next = { ...before, added: [], items: { ...before.items } }
    delete next.items[id(2)]
    delete next.items[id(5)]
    await applyChanges(sql, diffState(before, next))
    const after = await loadState(sql)
    expect(after.items[id(3)].music).toEqual({ kind: 'track', vendor: { name: 'spotify', id: 't1' }, disc: 1, number: 1, durationMs: 309000 })
    expect(after.placements).toHaveLength(1)
  })

  test('a track can be saved before its album and artist in the same batch (links are checked at commit)', async () => {
    const c = emptyChanges()
    c.upsert.items.push(
      { id: id(11), typeId: 'music', name: 'Airbag', music: { kind: 'track', albumId: id(10), artistId: id(12) } },
      { id: id(10), typeId: 'music', name: 'OK Computer', music: { kind: 'album', artistId: id(12), tracklistLoaded: true } },
      { id: id(12), typeId: 'music', name: 'Radiohead', music: { kind: 'artist' } },
    )
    await applyChanges(sql, c)
    expect((await loadState(sql)).items[id(11)].music).toEqual({ kind: 'track', albumId: id(10), artistId: id(12) })
  })

  test('the same vendor id can\'t be saved twice for one kind, but ids are our own, so non-vendor items are fine', async () => {
    const c = emptyChanges()
    c.upsert.items.push({ id: id(13), typeId: 'music', name: 'Kid A again', music: { kind: 'album', vendor: { name: 'spotify', id: 'okc-dup' }, tracklistLoaded: false } })
    await applyChanges(sql, c)
    const dup = emptyChanges()
    dup.upsert.items.push({ id: id(14), typeId: 'music', name: 'Kid A again', music: { kind: 'album', vendor: { name: 'spotify', id: 'okc-dup' }, tracklistLoaded: false } })
    await expect(applyChanges(sql, dup)).rejects.toThrow()
    const typed = emptyChanges()
    typed.upsert.items.push(
      { id: id(15), typeId: 'music', name: 'Demo', music: { kind: 'album', tracklistLoaded: false } },
      { id: id(16), typeId: 'music', name: 'Demo', music: { kind: 'album', tracklistLoaded: false } },
    )
    await applyChanges(sql, typed)
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

describe.skipIf(!url)('003.music-tables.sql on data saved before it (real database)', () => {
  const oldSchema = `${schema}_old`
  let admin: postgres.Sql, sql: postgres.Sql, early: string
  beforeAll(async () => {
    admin = postgres(url!, { max: 1, onnotice: () => {} })
    await admin.unsafe(`create schema ${oldSchema}`)
    sql = postgres(url!, { max: 2, onnotice: () => {}, connection: { search_path: oldSchema } })
    // Only the migrations before 003, so rows can be written the old way.
    early = await mkdtemp(join(tmpdir(), 'v2-migrations-'))
    const db = join(import.meta.dirname, 'db')
    for (const f of ['001.initial.sql', '002.colors-are-raw-dominant.sql']) await cp(join(db, f), join(early, f))
  })
  afterAll(async () => {
    await sql?.end()
    await admin?.unsafe(`drop schema if exists ${oldSchema} cascade`)
    await admin?.end()
    if (early) await rm(early, { recursive: true })
  })

  test('moves artists, albums and tracks into their tables, makes artists from names and tracks from tracklists, merges duplicates', async () => {
    await migrate(sql, early)
    const tracklist = [
      { id: 't1', name: 'Battery', number: 1, disc: 1, durationMs: 312360 },
      { id: 't2', name: 'Master Of Puppets', number: 2, disc: 1, durationMs: 515386 },
    ]
    await sql`insert into boards (id, type_id, name) values (${id(1)}, 'music', 'MUSIC')`
    await sql`insert into items (id, type_id, name, image, source_provider, source_kind, source_id, artist, year, tracks) values
      (${id(2)}, 'music', 'Master of Puppets', 'https://i.scdn.co/image/m', 'spotify', 'album', 'mop', 'Metallica', 1986, ${sql.json(tracklist)})`
    await sql`insert into items (id, type_id, name, image, source_provider, source_kind, source_id, artist, year, album_id) values
      (${id(3)}, 'music', 'Battery', 'https://i.scdn.co/image/m', 'spotify', 'track', 't1', 'Metallica', 1986, ${id(2)}),
      (${id(4)}, 'music', 'Battery', 'https://i.scdn.co/image/m', 'spotify', 'track', 't1', 'Metallica', 1986, ${id(2)})`
    await sql`insert into items (id, type_id, name, source_provider, source_kind, source_id) values (${id(5)}, 'music', 'Metallica', 'spotify', 'artist', 'met')`
    await sql`insert into items (id, type_id, name) values (${id(6)}, 'music', 'Typed thing')`
    await sql`insert into board_items (board_id, item_id, status, since) values (${id(1)}, ${id(2)}, 'added', 1)`
    await sql`insert into board_items (board_id, item_id, status, since, position, angle, length, ring) values
      (${id(1)}, ${id(4)}, 'placed', 2, 0.8, 0, 1.25, 0), (${id(1)}, ${id(6)}, 'placed', 3, 0.4, 1, 1.25, 0)`

    expect(await migrate(sql)).toEqual(['003.music-tables.sql'])
    const { items, placements, added } = await loadState(sql)

    // the duplicate Battery not on the board is gone; the placed one stays placed
    expect(items[id(3)]).toBeUndefined()
    expect(placements.map(p => p.itemId).sort()).toEqual([id(4), id(6)])
    expect(added.map(a => a.itemId)).toEqual([id(2)])
    // the artist name matched the existing artist item
    expect(items[id(2)]).toEqual({ id: id(2), typeId: 'music', name: 'Master of Puppets', image: 'https://i.scdn.co/image/m',
      music: { kind: 'album', vendor: { name: 'spotify', id: 'mop' }, artistId: id(5), year: 1986, tracklistLoaded: true } })
    expect(items[id(4)].music).toEqual({ kind: 'track', vendor: { name: 'spotify', id: 't1' }, albumId: id(2), artistId: id(5), disc: 1, number: 1, durationMs: 312360 })
    expect(items[id(5)].music).toEqual({ kind: 'artist', vendor: { name: 'spotify', id: 'met' } })
    expect(items[id(6)]).toEqual({ id: id(6), typeId: 'music', name: 'Typed thing' })
    // the tracklist entry that wasn't an item yet became one, off the board
    const made = Object.values(items).filter(i => i.music?.kind === 'track' && i.music.vendor?.id === 't2')
    expect(made).toEqual([expect.objectContaining({ name: 'Master Of Puppets', image: 'https://i.scdn.co/image/m',
      music: { kind: 'track', vendor: { name: 'spotify', id: 't2' }, albumId: id(2), artistId: id(5), disc: 1, number: 2, durationMs: 515386 } })])
    expect(Object.keys(items)).toHaveLength(5)
  })
})
