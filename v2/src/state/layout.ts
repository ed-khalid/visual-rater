/** Trunk height and fruit radius (world units). The 3D scene uses these too (scene/world.ts). */
export const TRUNK_HEIGHT = 8
export const FRUIT_RADIUS = 0.26

/** Directions a branch can point, around the trunk. */
export const BRANCH_DIRECTIONS = 12
/** Branches of items closer than this in height must point at least this many directions apart (2 of 12 = 60°). */
export const MIN_DIRECTION_GAP = 2
/** Branch length for the first ring, and how much longer each further ring is (world units). */
export const BRANCH_LENGTH = 1.25
export const RING_GROWTH = 0.8
/** Shortest and longest a branch can be dragged to. */
export const MIN_BRANCH_LENGTH = 0.45
export const MAX_BRANCH_LENGTH = 4.5
/** "Near in height", in placement units (0–1 along the trunk): three fruit radii. */
export const NEAR_POSITION = (FRUIT_RADIUS * 3) / TRUNK_HEIGHT

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const STEP = (2 * Math.PI) / BRANCH_DIRECTIONS

export type Branch = { angle: number, length: number, ring: number }

const directionOf = (angle: number) => ((Math.round(angle / STEP) % BRANCH_DIRECTIONS) + BRANCH_DIRECTIONS) % BRANCH_DIRECTIONS

const directionGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % BRANCH_DIRECTIONS
  return Math.min(d, BRANCH_DIRECTIONS - d)
}

/** Default length of a branch on a ring. */
export const ringLength = (ring: number) => BRANCH_LENGTH * (1 + ring * RING_GROWTH)

/** The golden-angle direction the n-th item on a board prefers, so the tree fills in evenly all round. */
export const preferredDirection = (n: number) => Math.round((n * GOLDEN_ANGLE) / STEP) % BRANCH_DIRECTIONS

/**
 * Picks a branch for one item at height `y`, given the branches already on the tree. Tries `preferred` first, then
 * the nearest directions either side of it; a direction is free if every existing branch on the same ring within
 * `nearY` in height is at least MIN_DIRECTION_GAP directions away. If a whole ring is full there, the next ring out
 * (longer branches, turned half a step so they don't hide behind the inner ones).
 */
export const chooseBranch = (y: number, existing: { y: number, angle: number, ring: number }[], nearY: number, preferred: number): Branch => {
  const neighbours = existing.filter(p => Math.abs(p.y - y) < nearY).map(p => ({ direction: directionOf(p.angle - (p.ring % 2) * STEP / 2), ring: p.ring }))
  for (let ring = 0; ; ring++) {
    const inRing = neighbours.filter(n => n.ring === ring)
    for (let k = 0; k < BRANCH_DIRECTIONS; k++) {
      const offset = k === 0 ? 0 : (k % 2 ? (k + 1) / 2 : -k / 2)
      const direction = (preferred + offset + BRANCH_DIRECTIONS) % BRANCH_DIRECTIONS
      if (inRing.every(n => directionGap(n.direction, direction) >= MIN_DIRECTION_GAP)) {
        return { angle: direction * STEP + (ring % 2) * STEP / 2, length: ringLength(ring), ring }
      }
    }
  }
}

/** Whether a branch at `y` clashes with any other branch near it in height (same ring, too close in direction). */
export const clashes = (y: number, branch: Branch, others: { y: number, angle: number, ring: number }[], nearY: number) => {
  const mine = directionOf(branch.angle - (branch.ring % 2) * STEP / 2)
  return others.some(o => Math.abs(o.y - y) < nearY && o.ring === branch.ring
    && directionGap(directionOf(o.angle - (o.ring % 2) * STEP / 2), mine) < MIN_DIRECTION_GAP)
}

/** The preferred direction nearest to an existing angle (to keep a moved branch pointing roughly the same way). */
export const directionNear = (angle: number, ring: number) => directionOf(angle - (ring % 2) * STEP / 2)

/**
 * Branches for a whole list of items, in placement order, each only looking at the ones before it (so adding an
 * item never moves the branches already on the tree). Used to lay out boards saved before branches were stored.
 *
 * @param ys heights, in placement order
 */
export const assignBranches = (ys: number[], nearY: number): Branch[] => {
  const placed: { y: number, angle: number, ring: number }[] = []
  return ys.map((y, i) => {
    const branch = chooseBranch(y, placed, nearY, preferredDirection(i))
    placed.push({ y, angle: branch.angle, ring: branch.ring })
    return branch
  })
}

/* ── Auto-align ──────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The planes auto-align uses, as turns away from the main plane (radians). The main plane is the vertical plane
 * through the trunk that faces the starting view, so its branches point straight left (−90°) or right (+90°) and
 * read side by side from the front. Further planes turn towards the viewer, 30° then 60°, never fully end-on.
 */
export const ALIGN_PLANES = [0, Math.PI / 6, -Math.PI / 6, Math.PI / 3, -Math.PI / 3]
/** Shortest and longest stems auto-align will use; past the longest, an item swings to the next plane instead. */
export const ALIGN_MIN_LENGTH = 0.8
export const ALIGN_MAX_LENGTH = 2.8
const ALIGN_STEP = 0.1
/** Fruit centres closer than this touch (two radii plus a little air). */
export const ALIGN_MIN_DISTANCE = FRUIT_RADIUS * 2 + 0.12

const fruitAt = (y: number, angle: number, length: number) => ({ x: Math.sin(angle) * length, y, z: Math.cos(angle) * length })
const apart = (a: { x: number, y: number, z: number }, b: { x: number, y: number, z: number }) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)

/** Stem lengths to try, nearest the normal length first (so stems only change as much as they have to). */
const ALIGN_LENGTHS = (() => {
  // Outward from the normal length in both directions, so the normal length itself is always a candidate.
  const out: number[] = [BRANCH_LENGTH]
  for (let k = 1; ; k++) {
    const shorter = +(BRANCH_LENGTH - k * ALIGN_STEP).toFixed(3), longer = +(BRANCH_LENGTH + k * ALIGN_STEP).toFixed(3)
    if (shorter < ALIGN_MIN_LENGTH - 1e-9 && longer > ALIGN_MAX_LENGTH + 1e-9) break
    if (shorter >= ALIGN_MIN_LENGTH - 1e-9) out.push(shorter)
    if (longer <= ALIGN_MAX_LENGTH + 1e-9) out.push(longer)
  }
  return out
})()

/** Stem lengths to try when an item must stay on its own plane: the usual ones, then on out to MAX_BRANCH_LENGTH. */
const OWN_PLANE_LENGTHS = (() => {
  const out = [...ALIGN_LENGTHS]
  for (let l = ALIGN_MAX_LENGTH + ALIGN_STEP; l <= MAX_BRANCH_LENGTH + 1e-9; l += ALIGN_STEP) out.push(+l.toFixed(3))
  return out
})()

/**
 * Planes for groups of items (albums, on MUSIC), as turns away from the main plane: the first group on the main
 * plane, the rest spread evenly round the half-turn (a plane has a branch either side of the trunk, so half a turn
 * covers every direction). Orbiting the camera then brings each group face-on in turn.
 */
export const groupPlanes = (groups: number) => Array.from({ length: groups }, (_, k) => (k * Math.PI) / Math.max(1, groups))

/**
 * Lays out every item so as many as possible sit on the main plane (left or right of the trunk). Items are taken
 * bottom to top; each goes on the main plane at the stem length nearest normal that keeps it clear of every fruit
 * already placed, on whichever side needs the smaller change (the emptier side on a tie). If no length up to
 * ALIGN_MAX_LENGTH clears on either side, it swings to the next plane (±30°, then ±60°). If nothing fits anywhere,
 * it takes the spot that's least crowded.
 *
 * With `planes` (a turn per item, e.g. from groupPlanes), each item stays on its own plane instead: either side of
 * the trunk, stems out to MAX_BRANCH_LENGTH if that's what it takes, and the least crowded spot on that plane if
 * nothing is clear.
 *
 * @param positions placement heights (0–1), in any order; results come back in the same order
 */
export const autoAlign = (positions: number[], planes?: number[]): Branch[] => {
  const order = positions.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p || a.i - b.i)
  const placed: { x: number, y: number, z: number }[] = []
  const perSide = new Map<string, number>()
  const result: Branch[] = new Array(positions.length)

  for (const { p, i } of order) {
    const y = p * TRUNK_HEIGHT
    const turns = planes ? [planes[i]] : ALIGN_PLANES
    const lengths = planes ? OWN_PLANE_LENGTHS : ALIGN_LENGTHS
    let chosen: { angle: number, length: number, key: string } | null = null
    for (const turn of turns) {
      let best: { angle: number, length: number, key: string, cost: number, count: number } | null = null
      for (const side of [1, -1]) {
        const angle = side * Math.PI / 2 + turn
        const key = `${turn}:${side}`
        const length = lengths.find(l => placed.every(q => apart(fruitAt(y, angle, l), q) >= ALIGN_MIN_DISTANCE))
        if (length === undefined) continue
        const cost = Math.abs(length - BRANCH_LENGTH), count = perSide.get(key) ?? 0
        if (!best || cost < best.cost - 1e-9 || (Math.abs(cost - best.cost) < 1e-9 && count < best.count)) best = { angle, length, key, cost, count }
      }
      if (best) { chosen = best; break }
    }
    if (!chosen) {
      // Nowhere is clear: take the spot with the most room.
      let most = -1
      for (const turn of turns) for (const side of [1, -1]) for (const length of lengths) {
        const angle = side * Math.PI / 2 + turn
        const room = Math.min(...placed.map(q => apart(fruitAt(y, angle, length), q)))
        if (room > most) { most = room; chosen = { angle, length, key: `${turn}:${side}` } }
      }
    }
    const c = chosen!
    placed.push(fruitAt(y, c.angle, c.length))
    perSide.set(c.key, (perSide.get(c.key) ?? 0) + 1)
    result[i] = { angle: c.angle, length: c.length, ring: 0 }
  }
  return result
}
