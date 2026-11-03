/**
 * Lane order: on the axis first, then alternating right/left, moving outward.
 * Lane n sits at x = n * laneWidth.
 */
const laneOrder = (i: number) => i === 0 ? 0 : (i % 2 === 1 ? (i + 1) / 2 : -i / 2)

/**
 * Assigns each node a horizontal lane so nodes closer than `minGap` vertically never overlap.
 * Nodes are taken bottom to top; each goes in the first lane (axis, then right, left, right…)
 * whose last node is at least `minGap` below it. Returns lanes in the input order.
 */
export const assignLanes = (ys: number[], minGap: number): number[] => {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y || a.i - b.i)
  const lastYInLane = new Map<number, number>()
  const lanes = new Array<number>(ys.length)
  for (const { y, i } of order) {
    for (let k = 0; ; k++) {
      const lane = laneOrder(k)
      const last = lastYInLane.get(lane)
      if (last === undefined || y - last >= minGap) {
        lanes[i] = lane
        lastYInLane.set(lane, y)
        break
      }
    }
  }
  return lanes
}
