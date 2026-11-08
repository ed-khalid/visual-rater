/**
 * Where things go on a 2D rater: a vertical spine, 100 at the top and 0 at the bottom, with each piece on a
 * horizontal leader out to the left or right of it, its label beyond it (outward). Worked out fresh every time from
 * scores alone; nothing here is stored.
 *
 * Rated pieces sit at their score's height and go out only as far as it takes to clear the pieces (and labels) already
 * placed on that side. Unrated pieces have no height that means anything, so they fill rows around the middle: the
 * middle row out to `maxReach` (labels included), then the row just below it, then above, and so on.
 */
export type Piece = {
  id: string
  /** 0 (bottom) to 1 (top). Unrated pieces: ignored (they go round the middle). */
  position: number
  unrated?: boolean
  /** Drawn radius (px). */
  radius: number
  /** The label's width beside it (px), 0 for none. */
  labelWidth: number
  /** Which side of the spine it must go (1 right, -1 left); otherwise whichever has fewer so far (ties: right). */
  side?: 1 | -1
}

export type Placed = {
  side: 1 | -1
  /** spine to the piece's centre (px) */
  x: number
  /** from the top of the spine (px) */
  y: number
  /** No room for its label: drawn as the cover alone (the hover card still names it). */
  bare?: boolean
}

export type PlaceOptions = {
  /** The spine's height (px). */
  height: number
  /** Shortest leader: spine to the nearest piece's edge (px). */
  minLength: number
  /**
   * Room right of the spine (px), labels included: unrated rows go no further, and a rated piece that would go
   * further tries the other side.
   */
  maxReach: number
  /** The same, left of the spine (default: maxReach). */
  maxReachLeft?: number
}

/** Room left between a piece's edge and its label, and around each piece and label. */
export const LABEL_GAP = 8
const PAD = 4
const STEP = 6

type Box = { side: 1 | -1, x0: number, x1: number, y0: number, y1: number }

const boxOf = (p: Piece, side: 1 | -1, x: number, y: number): Box => {
  const half = Math.max(p.radius, 8)
  return { side, x0: x - p.radius - PAD, x1: x + p.radius + (p.labelWidth ? LABEL_GAP + p.labelWidth : 0) + PAD, y0: y - half - PAD / 2, y1: y + half + PAD / 2 }
}
const bareOf = (p: Piece): Piece => ({ ...p, labelWidth: 0 })
const overlaps = (a: Box, b: Box) => a.side === b.side && a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

export const placePieces = (pieces: readonly Piece[], o: PlaceOptions): Map<string, Placed> => {
  const out = new Map<string, Placed>()
  const boxes: Box[] = []
  const count = { 1: 0, [-1]: 0 } as Record<1 | -1, number>
  const sideFor = (p: Piece): 1 | -1 => p.side ?? (count[1] <= count[-1] ? 1 : -1)
  const fits = (b: Box) => !boxes.some(o => overlaps(o, b))
  const put = (p: Piece, side: 1 | -1, x: number, y: number, bare = false) => {
    boxes.push(boxOf(bare ? bareOf(p) : p, side, x, y)); count[side]++
    out.set(p.id, bare ? { side, x, y, bare } : { side, x, y })
  }

  const room = (side: 1 | -1) => side > 0 ? o.maxReach : o.maxReachLeft ?? o.maxReach
  const spanOf = (p: Piece) => p.radius + (p.labelWidth ? LABEL_GAP + p.labelWidth : 0)
  const closest = (p: Piece, side: 1 | -1, y: number) => {
    let x = o.minLength + p.radius
    while (!fits(boxOf(p, side, x, y)) && x < 4000) x += STEP
    return x
  }

  // Rated first, at their heights: as close in as clears what's there. Free to pick a side, one that would run out of
  // room tries the other.
  for (const p of pieces.filter(p => !p.unrated)) {
    const y = (1 - Math.min(1, Math.max(0, p.position))) * o.height
    const first = sideFor(p), x = closest(p, first, y)
    if (x + spanOf(p) <= room(first)) { put(p, first, x, y); continue }
    // A piece free to pick a side tries the other one.
    const sides: (1 | -1)[] = p.side ? [first] : [first, (-first) as 1 | -1]
    if (sides.length > 1) {
      const x2 = closest(p, sides[1], y)
      if (x2 + spanOf(p) <= room(sides[1])) { put(p, sides[1], x2, y); continue }
    }
    // No room for it with its label: the cover alone, where it fits; failing that, the side it overruns less, pulled
    // back inside the room (overlapping a neighbour rather than going under the panels beside the rater).
    const b = bareOf(p), bare = sides.map(side => ({ side, x: closest(b, side, y) }))
    const fit = bare.find(c => c.x + p.radius <= room(c.side))
    if (fit) { put(p, fit.side, fit.x, y, true); continue }
    const best = bare.reduce((a, c) => c.x - room(c.side) < a.x - room(a.side) ? c : a)
    put(p, best.side, Math.max(o.minLength + p.radius, Math.min(best.x, room(best.side) - p.radius)), y, true)
  }

  // Unrated: rows round the middle, each filled out to maxReach before the next (below, then above, then further).
  const row = (r: number) => Math.max(2 * r + 10, 30)
  for (const p of pieces.filter(p => p.unrated)) {
    const side = sideFor(p), mid = o.height / 2
    let placed = false
    for (let k = 0; k < 40 && !placed; k++) {
      const offset = (k % 2 === 1 ? 1 : -1) * Math.ceil(k / 2) * row(p.radius)
      const y = mid + offset
      if (y < 0 || y > o.height) continue
      // The whole piece, label included, stays inside the room on its side (except the first in a row, if nothing fits).
      const span = spanOf(p)
      for (let x = o.minLength + p.radius; x + span <= room(side) || x === o.minLength + p.radius; x += STEP) {
        if (fits(boxOf(p, side, x, y))) { put(p, side, x, y); placed = true; break }
      }
    }
    if (!placed) put(p, side, o.minLength + p.radius, mid)
  }
  return out
}

/** Roughly how wide a label is (px), for layout before it's drawn: short titles keep this small. */
export const labelWidth = (text: string, pxPerChar = 6.4) => text ? Math.min(150, Math.ceil(text.length * pxPerChar) + 4) : 0

/** How far a rater's pieces reach from its spine, labels included (px). */
export const reachOf = (pieces: readonly Piece[], placed: ReadonlyMap<string, Placed>) =>
  Math.max(0, ...pieces.map(p => {
    const at = placed.get(p.id)
    return at ? at.x + p.radius + (p.labelWidth ? LABEL_GAP + p.labelWidth : 0) : 0
  }))
