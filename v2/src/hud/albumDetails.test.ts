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
    const { useStore, initialState } = await import('../state/store')
    const { loadAlbumDetails } = await import('./albumDetails')
    useStore.setState(initialState())
    useStore.getState().openType('music')
    const item = useStore.getState().addItem('Kid A', { source: { provider: 'spotify', kind: 'album', id: 'k'.repeat(22) } }, { stage: true })!
    let finish: (r: Response) => void = () => {}
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(r => { finish = r })))
    const load = loadAlbumDetails(item.id)
    useStore.getState().editItem(item.id, { year: 1999 }) // user edits while it loads
    finish(new Response(JSON.stringify({ id: 'k', name: 'Kid A', artist: 'Radiohead', year: 2000, tracks: [{ id: 't', name: 'Idioteque', number: 1, disc: 1, durationMs: 1 }] })))
    await load
    expect(useStore.getState().items[item.id]).toMatchObject({ year: 1999, artist: 'Radiohead' })
    expect(useStore.getState().items[item.id].tracks).toHaveLength(1)
    vi.unstubAllGlobals()
  })
})
