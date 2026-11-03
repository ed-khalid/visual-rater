import { describe, expect, test } from 'vitest'
import { assignBranches, BRANCH_DIRECTIONS, BRANCH_LENGTH } from './layout'

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
