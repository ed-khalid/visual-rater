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

  test('unrated pieces fill rows in their order, top to bottom, each out to maxReach, centred on the middle', () => {
    const many = Array.from({ length: 10 }, (_, i) => piece(`u${i}`, 0, { unrated: true, side: 1 }))
    const at = placePieces(many, o)
    // three to a row, labels and all: four rows, centred on 250
    expect(many.map(p => at.get(p.id)!.y)).toEqual([190, 190, 190, 230, 230, 230, 270, 270, 270, 310])
    for (const p of many) expect(at.get(p.id)!.x + 15 + 8 + 60).toBeLessThanOrEqual(400)
    // left to right within a row
    expect(at.get('u0')!.x).toBeLessThan(at.get('u1')!.x)
    expect(at.get('u1')!.x).toBeLessThan(at.get('u2')!.x)
  })

  test('a narrower piece later on never goes back to fill a gap in an earlier row', () => {
    const wide = (id: string) => piece(id, 0, { unrated: true, side: 1, labelWidth: 120 })
    const narrow = (id: string) => piece(id, 0, { unrated: true, side: 1, labelWidth: 10 })
    // a row holds two wide pieces, with room left over for a narrow one
    const list = [wide('a'), wide('b'), wide('c'), narrow('d')]
    const at = placePieces(list, o)
    expect(at.get('c')!.y).toBeGreaterThan(at.get('a')!.y)
    expect(at.get('d')!.y).toBe(at.get('c')!.y)
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
