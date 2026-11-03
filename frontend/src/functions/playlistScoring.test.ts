import { describe, expect, test } from "vitest"
import { reorderAndRescore, Scored } from "./playlistScoring"

const list = (...scores: number[]): Scored[] => scores.map((score, i) => ({ id: `s${i}`, score }))
const ids = (items: Scored[]) => items.map(it => it.id)
const scores = (items: Scored[]) => items.map(it => it.score)
const strictlyDescending = (items: Scored[]) => items.every((it, i) => i === 0 || it.score! < items[i - 1].score!)

describe("reorderAndRescore", () => {
    test("dragging down uses the neighbours after the move, not before", () => {
        // s0 (90) dropped between s1 (80) and s2 (70)
        const { items, updates } = reorderAndRescore(list(90, 80, 70, 60), 0, 1)
        expect(ids(items)).toEqual(['s1', 's0', 's2', 's3'])
        expect(items[1].score).toBe(75)
        expect(updates).toEqual([{ id: 's0', score: 75 }])
    })

    test("dragging up uses the neighbours after the move", () => {
        // s3 (60) dropped between s0 (90) and s1 (80)
        const { items } = reorderAndRescore(list(90, 80, 70, 60), 3, 1)
        expect(ids(items)).toEqual(['s0', 's3', 's1', 's2'])
        expect(items[1].score).toBe(85)
    })

    test("keeps the existing gap rules: split small gaps, +0.1 for gaps under 2, whole midpoint otherwise", () => {
        // s0 (99) dropped between the other two
        expect(reorderAndRescore(list(99, 80.5, 80), 0, 1).items[1].score).toBe(80.25)
        expect(reorderAndRescore(list(99, 81.5, 80), 0, 1).items[1].score).toBe(80.1)
        expect(reorderAndRescore(list(99, 85, 80), 0, 1).items[1].score).toBe(82)
    })

    test("dropping at the top goes just above the top song", () => {
        const { items } = reorderAndRescore(list(90, 80, 70), 2, 0)
        expect(items[0]).toEqual({ id: 's2', score: 90.01 })
    })

    test("dropping at the bottom goes just below the bottom song", () => {
        const { items } = reorderAndRescore(list(90, 80, 70), 0, 2)
        expect(items[2]).toEqual({ id: 's0', score: 69.99 })
    })

    test("never goes above 100 at the top: pushes the others down instead", () => {
        const { items, updates } = reorderAndRescore(list(100, 90, 50), 2, 0)
        expect(items[0]).toEqual({ id: 's2', score: 100 })
        expect(items[1]).toEqual({ id: 's0', score: 99.99 })
        expect(strictlyDescending(items)).toBe(true)
        expect(ids(updates).sort()).toEqual(['s0', 's2'])
    })

    test("never goes below 0 at the bottom, so the backend never sees a negative (which would erase the rating)", () => {
        const { items } = reorderAndRescore(list(50, 0), 0, 1)
        expect(items.map(it => it.score!).every(s => s >= 0)).toBe(true)
        expect(items[1].id).toBe('s0')
    })

    test("a tie between neighbours cascades upward and keeps the whole list in order", () => {
        // s0 80.01, s1 80, s2 80 — drop s3 between the two 80s
        const { items, updates } = reorderAndRescore(list(80.01, 80, 80, 10), 3, 2)
        expect(ids(items)).toEqual(['s0', 's1', 's3', 's2'])
        expect(strictlyDescending(items)).toBe(true)
        expect(ids(updates).sort()).toEqual(['s0', 's1', 's3'])
        expect(items[3].score).toBe(80) // the song below is untouched
    })

    test("a tie at the very top cascades downward instead of passing 100", () => {
        const { items } = reorderAndRescore(list(100, 100, 30), 2, 1)
        expect(items.every(it => it.score! <= 100)).toBe(true)
        expect(strictlyDescending(items)).toBe(true)
        expect(items[0]).toEqual({ id: 's0', score: 100 })
    })

    test("does not mutate the input", () => {
        const input = list(80, 80, 10)
        const copy = structuredClone(input)
        reorderAndRescore(input, 2, 1)
        expect(input).toEqual(copy)
    })

    test("no-op for same index or out-of-range indexes", () => {
        const input = list(90, 80)
        expect(reorderAndRescore(input, 1, 1)).toEqual({ items: input, updates: [] })
        expect(reorderAndRescore(input, -1, 0).updates).toEqual([])
        expect(reorderAndRescore(input, 0, 5).updates).toEqual([])
    })

    test("only changed songs are reported as updates", () => {
        const { updates } = reorderAndRescore(list(90, 80, 70, 60, 50), 4, 2)
        expect(ids(updates)).toEqual(['s4'])
        expect(scores(updates)).toEqual([75])
    })
})
