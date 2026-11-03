import { describe, expect, test, vi } from 'vitest'
import { formatDuration } from './albumDetails'

describe('formatDuration', () => {
  test('minutes and zero-padded seconds', () => {
    expect(formatDuration(251426)).toBe('4:11')
    expect(formatDuration(5000)).toBe('0:05')
    expect(formatDuration(3600000)).toBe('60:00')
  })
})

describe('loadAlbumDetails', () => {
  test('fills in only what is still missing when the load finishes', async () => {
    const { useStore, initialState, artistOf, tracksOf } = await import('../state/store')
    const { loadAlbumDetails, needsTracklist } = await import('./albumDetails')
    useStore.setState(initialState())
    useStore.getState().openType('music')
    const item = useStore.getState().addItem('Kid A', { music: { kind: 'album', vendor: { name: 'spotify', id: 'k'.repeat(22) }, tracklistLoaded: false } }, { stage: true })!
    let finish: (r: Response) => void = () => {}
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(r => { finish = r })))
    const load = loadAlbumDetails(item.id)
    useStore.getState().editItem(item.id, { year: 1999 }) // user edits while it loads
    finish(new Response(JSON.stringify({ id: 'k', name: 'Kid A', artist: 'Radiohead', artistId: 'rh', year: 2000, tracks: [{ id: 't', name: 'Idioteque', number: 1, disc: 1, durationMs: 1 }] })))
    await load
    const { items } = useStore.getState()
    expect(items[item.id].music).toMatchObject({ year: 1999, tracklistLoaded: true })
    expect(artistOf(items, items[item.id])?.name).toBe('Radiohead')
    expect(tracksOf(items, item.id)).toHaveLength(1)
    expect(needsTracklist(item.id)).toBe(false)
    vi.unstubAllGlobals()
  })
})
