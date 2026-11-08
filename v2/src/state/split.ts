import type { Persisted, Track } from '../shared/model'
import { treeNodes } from './board'

/**
 * Split view (MUSIC): every album on the tree gets a rater of its own, a trunk holding only its tracks, and the
 * raters stand side by side in a row. All this is view state, worked out here from the saved tree; nothing is saved.
 *
 * Each rater is turned so its album's branches point to the right from the front view (+x), so a row of them reads
 * like a row of charts, and the same height on every rater is the same score. The row goes in the order the albums
 * went on the tree; tracks with no album share a rater at the end. A rater the user has moved stays where they left it.
 */

/** Key of the rater for tracks with no album. */
export const SINGLES = '__singles'
/** Space between one rater's longest branch and the next trunk (world units), room for the song names. */
export const RATER_GAP = 2.4

export type RaterSpot = {
  /** The album's id, or SINGLES. */
  key: string
  /** Where its trunk stands on the floor. */
  x: number
  z: number
  /** How far to turn the album's branches (radians) so they point to +x. */
  turn: number
  /** Its longest branch. */
  reach: number
}

export const raterKey = (t: { albumId?: string }) => t.albumId ?? SINGLES

/** Shortest signed turn from one angle to another. */
const angleDelta = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

/** The way most of a group's branches point (the album's direction; overflow planes are a few off it). */
const mainAngle = (angles: number[]) => {
  const counts = new Map<number, number>()
  for (const a of angles) { const k = Math.round(a * 100) / 100; counts.set(k, (counts.get(k) ?? 0) + 1) }
  let best = angles[0], n = 0
  for (const [k, c] of counts) if (c > n) { best = k; n = c }
  return best
}

/** The row of raters: one per album on the tree (not hidden), in the order they went on, centred on the origin. */
export const splitLayout = (s: Persisted, hidden: ReadonlySet<string>, moved: Readonly<Record<string, { x: number, z: number }>>): RaterSpot[] => {
  const groups = new Map<string, Track[]>()
  for (const n of treeNodes(s, 'music')) {
    const t = n.entity as Track
    if (t.albumId && hidden.has(t.albumId)) continue
    const key = raterKey(t)
    let g = groups.get(key)
    if (!g) groups.set(key, g = [])
    g.push(t)
  }
  const order = [...groups.keys()].sort((a, b) => {
    if (a === SINGLES || b === SINGLES) return (a === SINGLES ? 1 : 0) - (b === SINGLES ? 1 : 0)
    return (s.albums[a]?.addedAt ?? 0) - (s.albums[b]?.addedAt ?? 0)
  })
  let x = 0
  const spots = order.map(key => {
    const tracks = groups.get(key)!
    const reach = Math.max(...tracks.map(t => t.branch!.length))
    const spot = { key, x, z: 0, turn: angleDelta(mainAngle(tracks.map(t => t.branch!.angle)), Math.PI / 2), reach }
    x += reach + RATER_GAP
    return spot
  })
  // Centre the row: from the first trunk to the end of the last one's branches.
  const last = spots[spots.length - 1]
  const shift = last ? -(last.x + last.reach) / 2 : 0
  return spots.map(sp => moved[sp.key] ? { ...sp, ...moved[sp.key] } : { ...sp, x: sp.x + shift })
}

/** The floor area the row covers, branches included (x from each trunk out to its reach; z a little either side). */
export const rowBounds = (spots: RaterSpot[]) => {
  if (spots.length === 0) return { minX: 0, maxX: 0, minZ: 0, maxZ: 0 }
  return {
    minX: Math.min(...spots.map(sp => sp.x)),
    maxX: Math.max(...spots.map(sp => sp.x + sp.reach)),
    minZ: Math.min(...spots.map(sp => sp.z - sp.reach * 0.5)),
    maxZ: Math.max(...spots.map(sp => sp.z + sp.reach * 0.5)),
  }
}
