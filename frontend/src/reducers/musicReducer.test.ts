import { describe, expect, test } from "vitest";
import { MusicState } from "../music/MusicState";
import { musicReducer } from "./musicReducer";

const initialState = (): MusicState => ({
    songFilters: { artistIds: null, albumIds: null },
    playlistFilters: { pageNumber: 0 },
    gridFilters: { pageNumber: 0 },
})

describe("PLAYLIST_FILTER_CHANGE", () => {
    test("sets artist and album filters", () => {
        const state = musicReducer(initialState(), { type: 'PLAYLIST_FILTER_CHANGE', filters: { artistIds: ['a1'], albumIds: ['b1', 'b2'] } })
        expect(state.songFilters).toEqual({ artistIds: ['a1'], albumIds: ['b1', 'b2'] })
    })

    test("null clears a filter", () => {
        const start = { ...initialState(), songFilters: { artistIds: ['a1'], albumIds: ['b1'] } }
        const state = musicReducer(start, { type: 'PLAYLIST_FILTER_CHANGE', filters: { artistIds: null, albumIds: null } })
        expect(state.songFilters).toEqual({ artistIds: null, albumIds: null })
    })

    test("omitted fields leave the existing filter untouched", () => {
        const start = { ...initialState(), songFilters: { artistIds: ['a1'], albumIds: ['b1'] } }
        const state = musicReducer(start, { type: 'PLAYLIST_FILTER_CHANGE', filters: { albumIds: ['b2'] } })
        expect(state.songFilters).toEqual({ artistIds: ['a1'], albumIds: ['b2'] })
    })

    test("sets pageNumber, including 0", () => {
        const onPage3 = musicReducer(initialState(), { type: 'PLAYLIST_FILTER_CHANGE', filters: { pageNumber: 3 } })
        expect(onPage3.playlistFilters.pageNumber).toBe(3)
        const backTo0 = musicReducer(onPage3, { type: 'PLAYLIST_FILTER_CHANGE', filters: { pageNumber: 0 } })
        expect(backTo0.playlistFilters.pageNumber).toBe(0)
    })

    test("pageNumber is kept when only filters change", () => {
        const start = { ...initialState(), playlistFilters: { pageNumber: 2 } }
        const state = musicReducer(start, { type: 'PLAYLIST_FILTER_CHANGE', filters: { artistIds: ['a1'] } })
        expect(state.playlistFilters.pageNumber).toBe(2)
    })

    test("does not mutate the previous state and leaves gridFilters alone", () => {
        const start = initialState()
        const snapshot = structuredClone(start)
        const state = musicReducer(start, { type: 'PLAYLIST_FILTER_CHANGE', filters: { artistIds: ['a1'], pageNumber: 1 } })
        expect(start).toEqual(snapshot)
        expect(state).not.toBe(start)
        expect(state.gridFilters).toBe(start.gridFilters)
    })
})
