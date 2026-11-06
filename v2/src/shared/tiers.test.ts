import { describe, expect, test } from 'vitest'
import { songTier } from '../state/board'
import { ALBUM_GRADES, ARTIST_GRADES, tierOf, tierRanges, TRACK_TIERS } from './tiers'

describe('tiers (v1 code set)', () => {
  test('track tiers at their edges', () => {
    const at = (score: number) => tierOf(TRACK_TIERS, score)!.name
    expect([100, 95, 94.99, 90, 85, 80, 75, 70, 65, 60, 55, 50, 49.99, 40, 30, 10, 9.99, 0].map(at)).toEqual([
      'CLASSIC', 'CLASSIC', 'GREAT', 'GREAT', 'VERY GOOD', 'GOOD', 'PLEASANT', 'DECENT', 'INTERESTING', 'OK', 'MEH',
      'AVERAGE', 'BORING', 'BORING', 'POOR', 'BAD', 'OFFENSIVE', 'OFFENSIVE',
    ])
  })

  test('unrated has no tier', () => {
    expect(tierOf(TRACK_TIERS, undefined)).toBeUndefined()
  })

  test('album and artist letter grades', () => {
    expect([85, 79.99, 70, 55, 39.99].map(s => tierOf(ALBUM_GRADES, s)!.name)).toEqual(['A+', 'A', 'B+', 'C', 'F'])
    // Metallica 70.6 and Radiohead 40.9 in v1
    expect([70.6, 40.9, 11.5, 11.49, 0].map(s => tierOf(ARTIST_GRADES, s)!.name)).toEqual(['A+', 'A', 'C', 'D', 'F'])
  })

  test('v1 colours: grades reuse the track tier colours', () => {
    expect(new Set(TRACK_TIERS.map(t => t.color)).size).toBe(TRACK_TIERS.length)
    expect(tierOf(ALBUM_GRADES, 62)!.color).toBe(tierOf(TRACK_TIERS, 66)!.color) // C+ = INTERESTING
    expect(tierOf(ARTIST_GRADES, 10.5)!.color).toBe(tierOf(TRACK_TIERS, 45)!.color) // D = BORING
  })

  test('ranges for the rubric run from each tier up to the next', () => {
    const ranges = tierRanges(TRACK_TIERS, 100)
    expect(ranges[0]).toEqual({ name: 'CLASSIC', from: 95, to: 100, color: 'rgb(79, 85, 144)' })
    expect(ranges.at(-1)).toEqual({ name: 'OFFENSIVE', from: 0, to: 10, color: 'rgb(8, 22, 22)' })
    expect(ranges.every((r, i) => i === 0 || r.to === ranges[i - 1].from)).toBe(true)
  })

  test('a song\'s tier follows its score as shown (rounded), so "65" is never labelled OK', () => {
    expect([64.6, 64.4, 94.5, 9.4].map(s => songTier(s).name)).toEqual(['INTERESTING', 'OK', 'CLASSIC', 'OFFENSIVE'])
  })
})
