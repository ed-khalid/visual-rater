import { describe, expect, test } from 'vitest'
import type { Persisted } from '../shared/model'
import { albumNodes, artistNodes, spreadNodes } from './drill'

const s = {
  movies: {}, books: {},
  artists: { m: { id: 'm', name: 'M' }, r: { id: 'r', name: 'R' }, x: { id: 'x', name: 'Staged only' } },
  albums: {
    a1: { id: 'a1', name: 'A1', artistId: 'm', addedAt: 2 }, a2: { id: 'a2', name: 'A2', artistId: 'm', addedAt: 1 },
    b1: { id: 'b1', name: 'B1', artistId: 'r', addedAt: 3 }, s1: { id: 's1', name: 'S1', artistId: 'x' },
  },
  tracks: {
    t1: { id: 't1', albumId: 'a1', artistId: 'm', score: 96 }, t2: { id: 't2', albumId: 'a1', artistId: 'm', score: 80 },
    t3: { id: 't3', albumId: 'a2', artistId: 'm', score: 70 }, t4: { id: 't4', albumId: 'b1', artistId: 'r' },
  },
} as unknown as Persisted

describe('read-only rater', () => {
  test('artists with an album on the tree, at their raw artist score (capped at 100); unrated mid-trunk', () => {
    const nodes = artistNodes(s, new Set())
    expect(nodes.map(n => [n.id, n.score, n.position])).toEqual([['m', 7.5, 0.075], ['r', undefined, 0.5]])
  })
  test("an artist's albums on the tree, at their album score; hidden ones left out", () => {
    expect(albumNodes(s, new Set(), 'm').map(n => [n.id, n.position])).toEqual([['a2', 0.7], ['a1', 0.88]])
    expect(albumNodes(s, new Set(['a2']), 'm').map(n => n.id)).toEqual(['a1'])
    expect(artistNodes(s, new Set(['b1'])).map(n => n.id)).toEqual(['m'])
  })
  test('nodes alternate sides and step out to clear one another at the same height', () => {
    const b = spreadNodes([{ id: 'a', position: 0.5 }, { id: 'b', position: 0.5 }, { id: 'c', position: 0.5 }, { id: 'd', position: 0.9 }])
    expect(Math.sign(b.get('a')!.angle)).toBe(1)
    expect(Math.sign(b.get('b')!.angle)).toBe(-1)
    expect(b.get('c')!.angle).toBe(b.get('a')!.angle)
    expect(b.get('c')!.length).toBeGreaterThan(b.get('a')!.length)
    expect(b.get('d')!.length).toBe(b.get('b')!.length)
  })
})
