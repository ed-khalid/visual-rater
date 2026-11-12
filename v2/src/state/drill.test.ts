import { describe, expect, test } from 'vitest'
import type { Persisted } from '../shared/model'
import { albumNodes, artistNodes } from './drill'

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
  test('artists with an album on the tree, at their raw artist score (capped at 100); unrated mid-spine', () => {
    const nodes = artistNodes(s, new Set())
    expect(nodes.map(n => [n.id, n.score, n.position])).toEqual([['m', 7.1, 0.071], ['r', undefined, 0.5]])
  })
  test("an artist's albums on the tree, at their album score; hidden ones left out", () => {
    expect(albumNodes(s, new Set(), 'm').map(n => [n.id, n.position])).toEqual([['a2', 0.7], ['a1', 0.88]])
    expect(albumNodes(s, new Set(['a2']), 'm').map(n => n.id)).toEqual(['a1'])
    expect(artistNodes(s, new Set(['b1'])).map(n => n.id)).toEqual(['m'])
  })
})
