import { describe, expect, test } from 'vitest'
import { assignLanes } from './layout'

describe('assignLanes', () => {
  test('well-spaced nodes all sit on the axis', () => {
    expect(assignLanes([0, 1, 2], 0.5)).toEqual([0, 0, 0])
  })

  test('stacked nodes fan out right, left, right, left', () => {
    expect(assignLanes([0, 0, 0, 0, 0], 0.5)).toEqual([0, 1, -1, 2, -2])
  })

  test('a node returns to the axis once it clears the one below', () => {
    // 0 and 0.2 collide; 0.6 is far enough above 0 to reuse the axis lane
    expect(assignLanes([0, 0.2, 0.6], 0.5)).toEqual([0, 1, 0])
  })

  test('result is in input order, whatever order the positions come in', () => {
    expect(assignLanes([0.6, 0.2, 0], 0.5)).toEqual([0, 1, 0])
  })

  test('no two nodes in the same lane are closer than minGap', () => {
    const ys = Array.from({ length: 200 }, (_, i) => Math.sin(i * 12.9898) * 5)
    const lanes = assignLanes(ys, 0.4)
    const byLane = new Map<number, number[]>()
    lanes.forEach((l, i) => byLane.set(l, [...(byLane.get(l) ?? []), ys[i]]))
    for (const group of byLane.values()) {
      group.sort((a, b) => a - b)
      for (let i = 1; i < group.length; i++) expect(group[i] - group[i - 1]).toBeGreaterThanOrEqual(0.4)
    }
  })

  test('empty input', () => {
    expect(assignLanes([], 0.5)).toEqual([])
  })
})
