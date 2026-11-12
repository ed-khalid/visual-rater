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

describe('artistScore (points by song tier, 0–5 scale)', () => {
  test('each song adds its tier\'s points, by its score as shown', () => {
    // CLASSIC 4.7 (93 shows 4.7), GREAT 4.5 (89 shows 4.5), GOOD 4.0–4.4 (85 and 79 alike), PLEASANT 3.8 (75), INTERESTING
    // 3.5 (69), OK and below nothing (3.4 and under)
    expect([93, 92.9, 89, 88.9, 85, 79, 78.9, 75, 74.9, 69, 68.9, 0].map(artistWeight)).toEqual([6, 4, 4, 1, 1, 1, 0.5, 0.5, 0.1, 0.1, 0, 0])
  })
  test('sums the points of rated, non-excluded tracks', () => {
    // 6 + 4 + 1 + 0.5 + 0.1 + 0 = 11.6
    const tracks = [96, 91, 86, 76, 71, 66].map(score => ({ score }))
    expect(artistScore(tracks)).toBe(11.6)
    expect(artistScore([...tracks, { score: 99, notASong: true }, { score: undefined }])).toBe(11.6)
  })
  test('no upper limit; undefined only when nothing counts', () => {
    expect(artistScore(Array(20).fill({ score: 97 }))).toBe(120)
    expect(artistScore([{ score: 30 }])).toBe(0)
    expect(artistScore([{ score: undefined }, { score: 99, notASong: true }])).toBeUndefined()
  })
})
