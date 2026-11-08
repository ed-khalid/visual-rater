import { describe, expect, test } from 'vitest'
import type { Persisted } from '../shared/model'
import { RATER_GAP, rowBounds, SINGLES, splitLayout } from './split'

const track = (id: string, albumId: string | undefined, angle: number, length: number, since = 0) =>
  ({ id, name: id, since, albumId, branch: { angle, length, ring: 0 } }) as unknown as Persisted['tracks'][string]
const state = (albums: Record<string, number>, ...tracks: ReturnType<typeof track>[]) => ({
  artists: {}, movies: {}, books: {},
  albums: Object.fromEntries(Object.entries(albums).map(([id, addedAt]) => [id, { id, name: id, addedAt }])),
  tracks: Object.fromEntries(tracks.map(t => [t.id, t])),
}) as unknown as Persisted

describe('splitLayout', () => {
  const s = state({ a: 1, b: 2 },
    track('b1', 'b', Math.PI, 2), track('a1', 'a', 0, 1), track('a2', 'a', 0, 3), track('a3', 'a', 0.52, 1.5), track('t', undefined, 1, 1))

  test('a rater per album in the order they went on, singles last, centred, spaced by reach', () => {
    const spots = splitLayout(s, new Set(), {})
    expect(spots.map(sp => sp.key)).toEqual(['a', 'b', SINGLES])
    expect(spots.map(sp => sp.reach)).toEqual([3, 2, 1])
    expect(spots[1].x - spots[0].x).toBeCloseTo(3 + RATER_GAP)
    expect(spots[2].x - spots[1].x).toBeCloseTo(2 + RATER_GAP)
    const b = rowBounds(spots)
    expect(b.minX + b.maxX).toBeCloseTo(0)
  })
  test("each turns so its album's main direction points to +x (overflow planes don't count)", () => {
    const [a, b] = splitLayout(s, new Set(), {})
    expect(a.turn).toBeCloseTo(Math.PI / 2)
    expect(b.turn).toBeCloseTo(-Math.PI / 2)
  })
  test('hidden albums leave the row; moved raters stay where they were put', () => {
    const spots = splitLayout(s, new Set(['b']), { a: { x: 9, z: -4 } })
    expect(spots.map(sp => sp.key)).toEqual(['a', SINGLES])
    expect(spots[0]).toMatchObject({ x: 9, z: -4 })
  })
})
