import { SCORE_END, SCORE_START } from "../models/CoreModels"

export type Scored = { id: string, score?: number | null }

/** Smallest gap kept between neighbouring songs when making room. */
export const SCORE_STEP = 0.01

const round = (n: number) => Math.round(n * 10000) / 10000
const clamp = (n: number) => Math.min(SCORE_END, Math.max(SCORE_START, n))
const scoreOf = (s: Scored) => s.score ?? SCORE_START

/**
 * Score for a song dropped between a higher neighbour (`above`) and a lower one (`below`).
 * Keeps the original playlist-rater feel: small gaps are split, large gaps snap to a whole number.
 * Returns null when there is no room strictly between them (tie or out-of-order neighbours).
 */
const scoreBetween = (above: number, below: number): number | null => {
    const diff = above - below
    let s: number
    if (diff < 1) s = below + diff / 2
    else if (diff < 2) s = below + 0.1
    else s = Math.floor((above + below) / 2)
    s = round(s)
    return (s > below && s < above) ? s : null
}

const arrayMove = <T,>(arr: T[], from: number, to: number): T[] => {
    const copy = [...arr]
    const [item] = copy.splice(from, 1)
    copy.splice(to, 0, item)
    return copy
}

/** Push songs above index `i` up until scores strictly decrease. Returns false if that would exceed SCORE_END. */
const cascadeUp = (scores: number[], i: number): boolean => {
    for (let k = i - 1; k >= 0 && scores[k] <= scores[k + 1]; k--) {
        scores[k] = round(scores[k + 1] + SCORE_STEP)
        if (scores[k] > SCORE_END) return false
    }
    return true
}

/** Push songs below index `i` down until scores strictly decrease. Clamps at SCORE_START. */
const cascadeDown = (scores: number[], i: number) => {
    for (let k = i + 1; k < scores.length && scores[k] >= scores[k - 1]; k++) {
        scores[k] = Math.max(SCORE_START, round(scores[k - 1] - SCORE_STEP))
    }
}

/**
 * Moves the song at `oldIndex` to `newIndex` in a list sorted by score (highest first)
 * and works out the new scores that keep that order.
 *
 * Returns the reordered list (with new scores applied) and just the songs whose score changed,
 * which are the ones to send to the backend. Never mutates its input.
 */
export const reorderAndRescore = <T extends Scored>(items: T[], oldIndex: number, newIndex: number): { items: T[], updates: T[] } => {
    if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0 || oldIndex >= items.length || newIndex >= items.length) {
        return { items, updates: [] }
    }
    const moved = arrayMove(items, oldIndex, newIndex)
    const original = moved.map(scoreOf)
    const above = newIndex > 0 ? original[newIndex - 1] : null
    const below = newIndex < moved.length - 1 ? original[newIndex + 1] : null

    const fitted =
        above !== null && below !== null ? scoreBetween(above, below) :
        above !== null ? (above - SCORE_STEP >= SCORE_START ? round(above - SCORE_STEP) : null) :
        below !== null ? (below + SCORE_STEP <= SCORE_END ? round(below + SCORE_STEP) : null) :
        original[newIndex]

    let scores: number[]
    if (fitted !== null) {
        scores = [...original]
        scores[newIndex] = fitted
    } else {
        // No room: sit just above the song below and push the songs above up.
        // If that would go past SCORE_END, sit just below the song above and push the songs below down instead.
        scores = [...original]
        const up = below !== null ? round(below + SCORE_STEP) : SCORE_END
        scores[newIndex] = up
        if (up > SCORE_END || !cascadeUp(scores, newIndex)) {
            scores = [...original]
            scores[newIndex] = above !== null ? clamp(round(above - SCORE_STEP)) : SCORE_END
            cascadeDown(scores, newIndex)
        }
    }

    const updates: T[] = []
    const result = moved.map((song, k) => {
        if (scores[k] === original[k] && song.score != null) return song
        const updated = { ...song, score: scores[k] }
        updates.push(updated)
        return updated
    })
    return { items: result, updates }
}
