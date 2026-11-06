import { describe, expect, test } from 'vitest'
import { albumScore, artistScore, artistWeight } from './scores'

describe('albumScore', () => {
  test('average of rated tracks; unrated ones are left out', () => {
    expect(albumScore([{ score: 80 }, { score: 90 }, { score: undefined }])).toBe(85)
  })
  test('undefined when nothing is rated', () => {
    expect(albumScore([{ score: undefined }])).toBeUndefined()
    expect(albumScore([])).toBeUndefined()
  })
})

describe('artistScore (v1 formula)', () => {
  test('tier weights, at each edge', () => {
    expect([95, 94.99, 90, 85, 80, 75, 70, 65, 64.99, 0].map(artistWeight)).toEqual([6, 4, 4, 2, 1, 0.5, 0.5, 0.1, 0, 0])
  })
  test('sums the weights of rated, non-excluded tracks', () => {
    // 6 + 4 + 2 + 1 + 0.5 + 0.5 + 0.1 + 0 = 14.1
    const tracks = [96, 91, 86, 81, 76, 71, 66, 40].map(score => ({ score }))
    expect(artistScore(tracks)).toBe(14.1)
    expect(artistScore([...tracks, { score: 99, excludeFromArtistScore: true }, { score: undefined }])).toBe(14.1)
  })
  test('no upper limit; undefined only when nothing counts', () => {
    expect(artistScore(Array(20).fill({ score: 97 }))).toBe(120)
    expect(artistScore([{ score: 30 }])).toBe(0)
    expect(artistScore([{ score: undefined }, { score: 99, excludeFromArtistScore: true }])).toBeUndefined()
  })
})
