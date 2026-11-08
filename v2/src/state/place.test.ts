import { describe, expect, test } from 'vitest'
import { type Piece, placePieces } from './place'

const o = { height: 500, minLength: 20, maxReach: 400 }
const piece = (id: string, position: number, extra: Partial<Piece> = {}): Piece => ({ id, position, radius: 15, labelWidth: 60, ...extra })

describe('placePieces', () => {
  test('rated pieces sit at their score, alternating sides, as close in as they can', () => {
    const at = placePieces([piece('a', 1), piece('b', 0), piece('c', 0.5)], o)
    expect(at.get('a')).toEqual({ side: 1, x: 35, y: 0 })
    expect(at.get('b')).toEqual({ side: -1, x: 35, y: 500 })
    expect(at.get('c')).toEqual({ side: 1, x: 35, y: 250 })
  })

  test('pieces at the same height on one side step out past each other\'s labels', () => {
    const at = placePieces([piece('a', 0.5, { side: 1 }), piece('b', 0.5, { side: 1 })], o)
    expect(at.get('a')!.x).toBe(35)
    // clear of a's piece, gap and label (and padding either side)
    expect(at.get('b')!.x).toBeGreaterThanOrEqual(35 + 15 + 8 + 60 + 4 + 4 + 15)
    expect(at.get('b')!.y).toBe(250)
  })

  test('unrated pieces fill rows round the middle, out to maxReach, then the next row', () => {
    const many = Array.from({ length: 10 }, (_, i) => piece(`u${i}`, 0, { unrated: true, side: 1 }))
    const at = placePieces(many, o)
    const ys = new Set(many.map(p => at.get(p.id)!.y))
    expect([...ys].sort((a, b) => a - b)).toEqual([210, 250, 290, 330]) // three to a row, labels and all
    for (const p of many) expect(at.get(p.id)!.x + 15 + 8 + 60).toBeLessThanOrEqual(400)
    // the middle row fills first
    expect(at.get('u0')!.y).toBe(250)
    expect(at.get('u1')!.y).toBe(250)
  })

  test('a fixed side is kept', () => {
    const at = placePieces([piece('a', 0.2, { side: -1 }), piece('b', 0.8, { side: -1 })], o)
    expect(at.get('a')!.side).toBe(-1)
    expect(at.get('b')!.side).toBe(-1)
  })

  test('a rated piece that would run out of room on its side goes to the other side', () => {
    // three at one height: right, left, then right again would need more room than the right has
    const at = placePieces([piece('a', 0.5), piece('b', 0.5), piece('c', 0.5)], { ...o, maxReach: 140, maxReachLeft: 400 })
    expect(at.get('a')!.side).toBe(1)
    expect(at.get('b')!.side).toBe(-1)
    expect(at.get('c')!.side).toBe(-1)
    expect(at.get('c')!.x).toBeGreaterThan(at.get('b')!.x)
  })

  test('with no room for its label either side, a piece goes in as its cover alone, inside the room', () => {
    const tight = { ...o, maxReach: 140, maxReachLeft: 140 }
    const at = placePieces(['a', 'b', 'c', 'd'].map(id => piece(id, 0.5)), tight)
    expect(at.get('a')!.bare).toBeUndefined()
    expect(at.get('b')!.bare).toBeUndefined()
    for (const id of ['c', 'd']) {
      expect(at.get(id)!.bare).toBe(true)
      expect(at.get(id)!.x + 15).toBeLessThanOrEqual(140)
    }
  })
})
