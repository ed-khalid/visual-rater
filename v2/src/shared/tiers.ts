/**
 * Names for scores, from the v1 app (frontend/src/models/ScoreModels.ts). Like album and artist scores, a tier is
 * worked out from a score whenever it's shown; it's never stored.
 *
 * Grades' bounds are on the stored 0–100 scale (albums) or the open-ended artist score, whatever scale scores are shown on.
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

/** Track (song) tiers depend on the scale in use: see scale.ts (TRACK_TIERS, in 0–100 like these). */

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
export const tierOf = <T extends Tier>(tiers: T[], score: number | undefined): T | undefined =>
  score === undefined ? undefined : tiers.find(t => score >= t.from) ?? tiers[tiers.length - 1]

/** Each tier with the range it covers, for showing a rubric: [from, to) with the top one ending at `max`. */
export const tierRanges = (tiers: Tier[], max: number) =>
  tiers.map((t, i) => ({ ...t, to: i === 0 ? max : tiers[i - 1].from }))
