import { describe, expect, test } from 'vitest'
import type { Persisted } from '../shared/model'
import { sameScore } from './board'

const track = (id: string, score: number | undefined, since = 0) =>
  ({ id, name: id, score, since, albumId: 'a', artistId: 'x' }) as unknown as Persisted['tracks'][string]
const state = (...tracks: ReturnType<typeof track>[]) =>
  ({ artists: {}, albums: {}, movies: {}, books: {}, tracks: Object.fromEntries(tracks.map(t => [t.id, t])) }) as unknown as Persisted

describe('sameScore', () => {
  test('same score as shown first, then the nearest within range; never the dragged one or unrated', () => {
    const s = state(track('me', 80), track('exact', 80.4), track('one', 81), track('two', 78), track('far', 84), track('none', undefined))
    expect(sameScore(s, 'music', 79.6, 'me').map(t => t.id)).toEqual(['exact', 'one', 'two'])
  })
  test('ties go to the most recently added; capped', () => {
    const s = state(track('old', 70, 1), track('new', 70, 5), track('mid', 70, 3))
    expect(sameScore(s, 'music', 70, 'x', 2).map(t => t.id)).toEqual(['new', 'mid'])
  })
  test('nothing near: empty', () => {
    expect(sameScore(state(track('a', 10)), 'music', 60, 'x')).toEqual([])
  })
})
