import { describe, expect, test } from 'vitest'
import { ALIGN_MAX_LENGTH, ALIGN_MIN_DISTANCE, assignBranches, autoAlign, BRANCH_DIRECTIONS, BRANCH_LENGTH, TRUNK_HEIGHT } from './layout'

const STEP = (2 * Math.PI) / BRANCH_DIRECTIONS
const direction = (angle: number) => Math.round(angle / STEP) % BRANCH_DIRECTIONS
const gapDegrees = (a: number, b: number) => {
  const d = Math.abs(a - b) % (2 * Math.PI)
  return Math.min(d, 2 * Math.PI - d) * 180 / Math.PI
}

describe('assignBranches', () => {
  test('items far apart in height spiral around the trunk instead of all pointing one way', () => {
    const branches = assignBranches([0, 1, 2, 3, 4, 5], 0.5)
    expect(new Set(branches.map(b => direction(b.angle))).size).toBeGreaterThan(3)
    expect(branches.every(b => b.length === BRANCH_LENGTH)).toBe(true)
  })

  test('items at the same height on the same ring point at least 60° apart', () => {
    const branches = assignBranches(Array(10).fill(0), 0.5)
    for (let i = 0; i < branches.length; i++)
      for (let j = i + 1; j < branches.length; j++)
        if (branches[i].ring === branches[j].ring)
          expect(gapDegrees(branches[i].angle, branches[j].angle)).toBeGreaterThanOrEqual(59.9)
  })

  test('when the inner ring is full at a height, items go to longer outer branches', () => {
    const branches = assignBranches(Array(10).fill(0), 0.5)
    expect(branches.filter(b => b.ring === 0).length).toBeLessThanOrEqual(6)
    const outer = branches.filter(b => b.ring > 0)
    expect(outer.length).toBeGreaterThan(0)
    expect(outer.every(b => b.length > BRANCH_LENGTH)).toBe(true)
  })

  test('adding an item never moves the branches already there', () => {
    const ys = [0.2, 0.25, 1.5, 0.22, 3]
    const before = assignBranches(ys, 0.5)
    const after = assignBranches([...ys, 0.21, 0.2], 0.5)
    expect(after.slice(0, ys.length)).toEqual(before)
  })

  test('closeness is by height: the same direction is fine once items are far enough apart', () => {
    const many = Array.from({ length: 60 }, (_, i) => i * 0.1)
    const branches = assignBranches(many, 0.5)
    for (let i = 0; i < many.length; i++)
      for (let j = i + 1; j < many.length; j++)
        if (Math.abs(many[i] - many[j]) < 0.5 && branches[i].ring === branches[j].ring)
          expect(gapDegrees(branches[i].angle, branches[j].angle)).toBeGreaterThanOrEqual(59.9)
  })

  test('empty input', () => {
    expect(assignBranches([], 0.5)).toEqual([])
  })
})

describe('autoAlign', () => {
  const pos = (p: number, b: { angle: number, length: number }) => ({ x: Math.sin(b.angle) * b.length, y: p * TRUNK_HEIGHT, z: Math.cos(b.angle) * b.length })
  const minGap = (ps: number[], bs: { angle: number, length: number }[]) => {
    let m = Infinity
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = pos(ps[i], bs[i]), b = pos(ps[j], bs[j]); m = Math.min(m, Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z))
    }
    return m
  }
  const onMainPlane = (angle: number) => Math.abs(Math.abs(Math.sin(angle)) - 1) < 1e-9

  test('well-spaced items all sit on the main plane at the normal length', () => {
    const bs = autoAlign([0.1, 0.3, 0.5, 0.7, 0.9])
    expect(bs.every(b => onMainPlane(b.angle) && b.length === BRANCH_LENGTH)).toBe(true)
  })

  test('two items at the same height go either side of the trunk, both at the normal length', () => {
    const [a, b] = autoAlign([0.5, 0.5])
    expect(Math.sign(Math.sin(a.angle))).toBe(-Math.sign(Math.sin(b.angle)))
    expect([a.length, b.length]).toEqual([BRANCH_LENGTH, BRANCH_LENGTH])
  })

  test('crowded heights stagger stem lengths on the main plane before using another plane', () => {
    const ps = [0.5, 0.5, 0.5, 0.5]
    const bs = autoAlign(ps)
    expect(bs.every(b => onMainPlane(b.angle))).toBe(true)
    expect(new Set(bs.map(b => b.length)).size).toBeGreaterThan(1)
    expect(minGap(ps, bs)).toBeGreaterThanOrEqual(ALIGN_MIN_DISTANCE - 1e-9)
  })

  test('stems never pass the threshold; once the main plane is full, items swing to another plane', () => {
    const ps = Array(14).fill(0.5)
    const bs = autoAlign(ps)
    expect(bs.every(b => b.length <= ALIGN_MAX_LENGTH + 1e-9)).toBe(true)
    expect(bs.some(b => !onMainPlane(b.angle))).toBe(true)
    expect(minGap(ps, bs)).toBeGreaterThanOrEqual(ALIGN_MIN_DISTANCE - 1e-9)
  })

  test('results come back in input order, and the same input always gives the same layout', () => {
    const ps = [0.9, 0.2, 0.5, 0.52, 0.48]
    expect(autoAlign(ps)).toEqual(autoAlign(ps))
    const sorted = autoAlign([...ps].sort())
    const byPos = new Map([...ps].sort().map((p, i) => [p, sorted[i]]))
    expect(autoAlign(ps)).toEqual(ps.map(p => byPos.get(p)))
  })

  test('a realistic board (an album at one height plus scattered items) has no touching fruit', () => {
    const ps = [...Array(11).fill(0.5), 0.1, 0.33, 0.47, 0.55, 0.8]
    expect(minGap(ps, autoAlign(ps))).toBeGreaterThanOrEqual(ALIGN_MIN_DISTANCE - 1e-9)
  })
})
