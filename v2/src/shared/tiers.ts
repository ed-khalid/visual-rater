/**
 * Names for scores, from the v1 app (frontend/src/models/ScoreModels.ts). Like album and artist scores, a tier is
 * worked out from a score whenever it's shown; it's never stored.
 *
 * For now these are an informational guide only (the rubric popup on the MUSIC tree shows the track tiers).
 */

export type Tier = { name: string, from: number, color: string }

/** v1's tier colours (frontend/src/models/ScoreModels.ts), as they were. Album and artist grades reuse them. */
export const TIER_COLORS = {
  CLASSIC: 'rgb(79, 85, 144)',
  GREAT: 'rgb(32, 79, 96)',
  VERY_GOOD: 'rgb(40, 83, 53)',
  GOOD: 'rgb(47, 101, 63)',
  PLEASANT: 'rgb(78, 118, 90)',
  DECENT: 'rgb(96, 130, 70)',
  INTERESTING: 'rgb(86, 98, 40)',
  OK: 'rgb(156, 156, 58)',
  MEH: 'rgb(162, 140, 75)',
  AVERAGE: 'rgb(179, 140, 55)',
  BORING: 'rgb(161, 107, 57)',
  POOR: 'rgb(167, 55, 38)',
  BAD: 'rgb(88, 19, 16)',
  OFFENSIVE: 'rgb(8, 22, 22)',
  UNRATED: 'rgb(96, 94, 94)',
} as const
const C = TIER_COLORS

/** Track tiers on the 0–100 scale, best first; each runs from `from` up to the next tier's `from`. */
export const TRACK_TIERS: Tier[] = [
  { name: 'CLASSIC', from: 95, color: C.CLASSIC },
  { name: 'GREAT', from: 90, color: C.GREAT },
  { name: 'VERY GOOD', from: 85, color: C.VERY_GOOD },
  { name: 'GOOD', from: 80, color: C.GOOD },
  { name: 'PLEASANT', from: 75, color: C.PLEASANT },
  { name: 'DECENT', from: 70, color: C.DECENT },
  { name: 'INTERESTING', from: 65, color: C.INTERESTING },
  { name: 'OK', from: 60, color: C.OK },
  { name: 'MEH', from: 55, color: C.MEH },
  { name: 'AVERAGE', from: 50, color: C.AVERAGE },
  { name: 'BORING', from: 40, color: C.BORING },
  { name: 'POOR', from: 30, color: C.POOR },
  { name: 'BAD', from: 10, color: C.BAD },
  { name: 'OFFENSIVE', from: 0, color: C.OFFENSIVE },
]

/** Album letter grades, by the album's score (the average of its rated tracks, 0–100). */
export const ALBUM_GRADES: Tier[] = [
  { name: 'A+', from: 80, color: C.CLASSIC },
  { name: 'A', from: 75, color: C.GREAT },
  { name: 'B+', from: 70, color: C.VERY_GOOD },
  { name: 'B', from: 65, color: C.GOOD },
  { name: 'C+', from: 60, color: C.INTERESTING },
  { name: 'C', from: 55, color: C.AVERAGE },
  { name: 'D', from: 50, color: C.POOR },
  { name: 'E', from: 40, color: C.BAD },
  { name: 'F', from: 0, color: C.OFFENSIVE },
]

/** Artist letter grades, by the artist's score (an open-ended weighted count, not 0–100). */
export const ARTIST_GRADES: Tier[] = [
  { name: 'A+', from: 70, color: C.CLASSIC },
  { name: 'A', from: 36, color: C.GREAT },
  { name: 'B+', from: 30, color: C.VERY_GOOD },
  { name: 'B', from: 24, color: C.GOOD },
  { name: 'C+', from: 17, color: C.PLEASANT },
  { name: 'C', from: 11.5, color: C.INTERESTING },
  { name: 'D', from: 10, color: C.BORING },
  { name: 'E', from: 5, color: C.POOR },
  { name: 'F', from: 0, color: C.BAD },
]

/** The tier a score falls in (the first, from the top, whose lower bound it reaches); undefined when unrated. */
export const tierOf = (tiers: Tier[], score: number | undefined): Tier | undefined =>
  score === undefined ? undefined : tiers.find(t => score >= t.from) ?? tiers[tiers.length - 1]

/** Each tier with the range it covers, for showing a rubric: [from, to) with the top one ending at `max`. */
export const tierRanges = (tiers: Tier[], max: number) =>
  tiers.map((t, i) => ({ ...t, to: i === 0 ? max : tiers[i - 1].from }))
