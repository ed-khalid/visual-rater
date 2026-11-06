import { describe, expect, test } from 'vitest'
import { emptyPersisted, type Persisted } from './model'
import { diffState, everything, isEmpty, mergeChanges } from './sync'

const base = (): Persisted => ({
  ...emptyPersisted(),
  artists: { r: { id: 'r', name: 'Radiohead' } },
  albums: { a: { id: 'a', name: 'Kid A', artistId: 'r', tracklistLoaded: true, stagedAt: 1, addedAt: 2 } },
  tracks: { t: { id: 't', name: 'Idioteque', albumId: 'a', artistId: 'r', score: 90, branch: { angle: 0, length: 1.25, ring: 0 }, since: 2 } },
})

describe('diffState', () => {
  test('no change, nothing to send', () => {
    const s = base()
    expect(isEmpty(diffState(s, { ...s }))).toBe(true)
  })

  test('a changed record is upserted in its collection; a removed one is deleted', () => {
    const s = base()
    const next = { ...s, tracks: { t: { ...s.tracks.t, score: 95 } }, albums: {} }
    const c = diffState(s, next)
    expect(c.upsert.tracks).toEqual([expect.objectContaining({ id: 't', score: 95 })])
    expect(c.remove.albums).toEqual(['a'])
    expect(c.upsert.artists).toEqual([])
  })

  test('everything() is a full upsert of a state', () => {
    const c = everything(base())
    expect([c.upsert.artists.length, c.upsert.albums.length, c.upsert.tracks.length]).toEqual([1, 1, 1])
  })
})

describe('mergeChanges', () => {
  test('a later upsert wins; a later delete cancels an earlier upsert and vice versa', () => {
    const s = base()
    const v1 = diffState(s, { ...s, tracks: { t: { ...s.tracks.t, name: 'v1' } } })
    const v2 = diffState(s, { ...s, tracks: { t: { ...s.tracks.t, name: 'v2' } } })
    expect(mergeChanges(v1, v2).upsert.tracks.map(t => t.name)).toEqual(['v2'])
    const del = diffState(s, { ...s, tracks: {} })
    const merged = mergeChanges(v1, del)
    expect(merged.upsert.tracks).toEqual([])
    expect(merged.remove.tracks).toEqual(['t'])
    expect(mergeChanges(del, v2).remove.tracks).toEqual([])
  })
})
