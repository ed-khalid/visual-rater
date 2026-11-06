import { describe, expect, test } from 'vitest'
import { emptyPersisted, type Persisted, type Track } from '../shared/model'
import { ratingFocus } from './board'

const track = (id: string, score?: number, extra: Partial<Track> = {}): Track =>
  ({ id, name: id, ...(score !== undefined ? { score } : {}), branch: { angle: Math.PI / 2, length: 1.25, ring: 0 }, ...extra }) as Track

const state = (...tracks: Track[]): Persisted => ({ ...emptyPersisted(), tracks: Object.fromEntries(tracks.map(t => [t.id, t])) })

describe('active rating (ratingFocus)', () => {
  test('keeps the batch, their album and artist bright while any of them is unrated', () => {
    const s = state(track('a', undefined, { albumId: 'al', artistId: 'ar' }), track('b', 70, { albumId: 'al', artistId: 'ar' }), track('old', 90))
    expect(ratingFocus(s, 'music', ['a', 'b'])).toEqual(new Set(['a', 'b', 'al', 'ar']))
  })

  test('ends once every one of them has a score, or has left the tree', () => {
    expect(ratingFocus(state(track('a', 60), track('b', 70)), 'music', ['a', 'b'])).toBeNull()
    expect(ratingFocus(state(track('a', undefined, { hidden: true }), track('b', 70)), 'music', ['a', 'b'])).toBeNull()
    expect(ratingFocus(state(track('b', 70)), 'music', ['gone', 'b'])).toBeNull()
  })
})
