/** Directions a branch can point, around the trunk. */
export const BRANCH_DIRECTIONS = 12
/** Branches of items closer than this in height must point at least this many directions apart (2 of 12 = 60°). */
export const MIN_DIRECTION_GAP = 2
/** Branch length for the first ring, and how much longer each further ring is. */
export const BRANCH_LENGTH = 1.25
export const RING_GROWTH = 0.8

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const STEP = (2 * Math.PI) / BRANCH_DIRECTIONS

export type Branch = { angle: number, length: number, ring: number }

const directionGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % BRANCH_DIRECTIONS
  return Math.min(d, BRANCH_DIRECTIONS - d)
}

/**
 * Gives each item a branch: the direction it grows out of the trunk, and its length.
 *
 * Items are taken in the order they were placed, and each one only looks at earlier items, so adding an item
 * never moves the branches already on the tree. Each item prefers the next direction in a golden-angle spiral
 * (so the tree fills in evenly all round); if that's too close to an earlier item near the same height
 * (within `nearY`), it takes the nearest free direction, and if a whole ring is full there, the next ring out.
 *
 * @param ys heights, in placement order
 */
export const assignBranches = (ys: number[], nearY: number): Branch[] => {
  const placed: { y: number, direction: number, ring: number }[] = []
  return ys.map((y, i) => {
    const neighbours = placed.filter(p => Math.abs(p.y - y) < nearY)
    const preferred = Math.round((i * GOLDEN_ANGLE) / STEP) % BRANCH_DIRECTIONS
    for (let ring = 0; ; ring++) {
      const inRing = neighbours.filter(n => n.ring === ring)
      // try the preferred direction, then step outwards from it: +1, -1, +2, -2 …
      for (let k = 0; k < BRANCH_DIRECTIONS; k++) {
        const offset = k === 0 ? 0 : (k % 2 ? (k + 1) / 2 : -k / 2)
        const direction = (preferred + offset + BRANCH_DIRECTIONS) % BRANCH_DIRECTIONS
        if (inRing.every(n => directionGap(n.direction, direction) >= MIN_DIRECTION_GAP)) {
          placed.push({ y, direction, ring })
          // outer rings are turned half a step so they don't hide behind inner branches
          return { angle: direction * STEP + (ring % 2) * STEP / 2, length: BRANCH_LENGTH * (1 + ring * RING_GROWTH), ring }
        }
      }
    }
  })
}
