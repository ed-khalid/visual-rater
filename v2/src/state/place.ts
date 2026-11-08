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

export type Placed = { side: 1 | -1, /** spine to the piece's centre (px) */ x: number, /** from the top of the spine (px) */ y: number }

export type PlaceOptions = {
  /** The spine's height (px). */
  height: number
  /** Shortest leader: spine to the nearest piece's edge (px). */
  minLength: number
  /** How far out unrated rows go before starting another row (px from the spine). */
  maxReach: number
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
const overlaps = (a: Box, b: Box) => a.side === b.side && a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

export const placePieces = (pieces: readonly Piece[], o: PlaceOptions): Map<string, Placed> => {
  const out = new Map<string, Placed>()
  const boxes: Box[] = []
  const count = { 1: 0, [-1]: 0 } as Record<1 | -1, number>
  const sideFor = (p: Piece): 1 | -1 => p.side ?? (count[1] <= count[-1] ? 1 : -1)
  const fits = (b: Box) => !boxes.some(o => overlaps(o, b))
  const put = (p: Piece, side: 1 | -1, x: number, y: number) => {
    boxes.push(boxOf(p, side, x, y)); count[side]++
    out.set(p.id, { side, x, y })
  }

  // Rated first, at their heights: as close in as clears what's there.
  for (const p of pieces.filter(p => !p.unrated)) {
    const side = sideFor(p), y = (1 - Math.min(1, Math.max(0, p.position))) * o.height
    let x = o.minLength + p.radius
    while (!fits(boxOf(p, side, x, y)) && x < 4000) x += STEP
    put(p, side, x, y)
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
      // The whole piece, label included, stays inside maxReach (except the first in a row, if nothing fits).
      const span = p.radius + (p.labelWidth ? LABEL_GAP + p.labelWidth : 0)
      for (let x = o.minLength + p.radius; x + span <= o.maxReach || x === o.minLength + p.radius; x += STEP) {
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
