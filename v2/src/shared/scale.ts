/**
 * The scale scores are shown and entered on. Scores are always stored 0–100 (the database, the score views, saving,
 * the rater's heights); a scale is only how they read: shown 0–`max`, in steps of `step`, and the song tiers on it.
 * A stepped scale also snaps what's rated (dragged or typed) to its steps; a continuous one keeps where it was let go.
 *
 * Album scores (averages) are shown on the scale too, more finely. Artist scores are an open-ended count of points (each
 * song adds its tier's `points`), not on any scale; the album and artist letter grades' bounds are 0–100 and that count.
 */
import { TIER_COLORS as C, type Tier } from './tiers'

export type Scale = {
  /** Top of the scale as shown (the bottom is 0). */
  max: number
  /** Scores are shown, and rated, in steps of this much. */
  step: number
  /** Rated scores keep where they were let go (only shown rounded to the step); otherwise they snap to it. */
  continuous?: boolean
  /**
   * Song tiers, best first, each from `from` (shown units) up to the next one's; `points`: what a song in it adds to
   * its artist's score (none: nothing).
   */
  tiers: (Tier & { points?: number })[]
  /** Where the charts' score axis is labelled, in shown units. */
  chartTicks: number[]
}

/** The original scale: 0–100, whole numbers shown, scores kept where they're let go. v1's song tiers and artist points. */
export const HUNDRED: Scale = {
  max: 100, step: 1, continuous: true, chartTicks: [0, 25, 50, 75, 100],
  tiers: [
    { name: 'CLASSIC', from: 95, color: C.CLASSIC, points: 6 },
    { name: 'GREAT', from: 90, color: C.GREAT, points: 4 },
    { name: 'VERY GOOD', from: 85, color: C.VERY_GOOD, points: 2 },
    { name: 'GOOD', from: 80, color: C.GOOD, points: 1 },
    { name: 'PLEASANT', from: 75, color: C.PLEASANT, points: 0.5 },
    { name: 'DECENT', from: 70, color: C.DECENT, points: 0.5 },
    { name: 'INTERESTING', from: 65, color: C.INTERESTING, points: 0.1 },
    { name: 'OK', from: 60, color: C.OK },
    { name: 'MEH', from: 55, color: C.MEH },
    { name: 'AVERAGE', from: 50, color: C.AVERAGE },
    { name: 'BORING', from: 40, color: C.BORING },
    { name: 'POOR', from: 30, color: C.POOR },
    { name: 'BAD', from: 10, color: C.BAD },
    { name: 'OFFENSIVE', from: 0, color: C.OFFENSIVE },
  ],
}

/** 0–5 in steps of 0.1. Its artist points are also in the music_artist_scores view (server/db/005): change both together. */
export const FIVE: Scale = {
  max: 5, step: 0.1, chartTicks: [0, 1, 2, 3, 4, 5],
  tiers: [
    { name: 'CLASSIC', from: 4.7, color: C.CLASSIC, points: 6 },
    { name: 'GREAT', from: 4.5, color: C.GREAT, points: 4 },
    { name: 'GOOD', from: 4, color: C.GOOD, points: 1 },
    { name: 'PLEASANT', from: 3.75, color: C.PLEASANT, points: 0.5 },
    { name: 'INTERESTING', from: 3.5, color: C.INTERESTING, points: 0.1 },
    { name: 'OK', from: 3, color: C.OK },
    { name: 'AVERAGE', from: 2.5, color: C.AVERAGE },
    { name: 'BAD', from: 0.5, color: C.BAD },
    { name: 'OFFENSIVE', from: 0, color: C.OFFENSIVE },
  ],
}

/** The scale in use. */
export const SCALE: Scale = FIVE

/** Float noise off (0.1 * 3 and the like). */
const clean = (x: number) => Math.round(x * 1e6) / 1e6
const decimals = (x: number) => (String(x).split('.')[1] ?? '').length

/** A stored score (0–100) in shown units, unrounded. */
export const toShown = (stored: number, scale = SCALE) => clean(stored / 100 * scale.max)
/** A shown score back to 0–100. */
export const toStored = (shown: number, scale = SCALE) => clean(shown / scale.max * 100)

/** A stored score as shown: rounded to the scale's step, in shown units. */
export const shownValue = (stored: number, scale = SCALE) => clean(Math.round(clean(toShown(stored, scale) / scale.step)) * scale.step)
/** The stored score of what's shown (0–100): what tiers and "the same score" go by, so they agree with the number. */
export const roundToShown = (stored: number, scale = SCALE) => toStored(shownValue(stored, scale), scale)
/** What a rating (drag or typed) stores: snapped to the step, or as it was on a continuous scale. */
export const snapScore = (stored: number, scale = SCALE) => scale.continuous ? stored : roundToShown(stored, scale)

/** A song's (or movie's, book's) score as shown: to the step, with the step's decimals (4.0, 3.7; 80 on 0–100). */
export const formatScore = (stored: number, scale = SCALE) => shownValue(stored, scale).toFixed(decimals(scale.step))
/** A finer reading (album averages, bounds): to `digits` decimals, trailing zeros dropped (3.57, 3.5, 4). */
export const formatPrecise = (stored: number, digits = 2, scale = SCALE) => String(clean(Math.round(clean(toShown(stored, scale) * 10 ** digits)) / 10 ** digits))

/** The song tiers with `from` in stored units (0–100), for tierOf. */
export const TRACK_TIERS: (Tier & { points?: number })[] = SCALE.tiers.map(t => ({ ...t, from: toStored(t.from) }))

/**
 * Each song tier with the shown scores it covers, the steps a score can be shown at: CLASSIC 4.7–5, PLEASANT 3.8–3.9
 * (from 3.75, the first step at or above it is 3.8).
 */
export const tierSteps = (scale = SCALE) => scale.tiers.map((t, i) => {
  const firstStep = (x: number) => clean(Math.ceil(clean(x / scale.step)) * scale.step)
  const lo = firstStep(t.from), hi = i === 0 ? scale.max : clean(firstStep(scale.tiers[i - 1].from) - scale.step)
  const f = (x: number) => x.toFixed(decimals(scale.step))
  return { ...t, lo, hi, range: lo === hi ? f(lo) : `${f(lo)}–${f(hi)}` }
})
