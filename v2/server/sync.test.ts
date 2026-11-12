import { describe, expect, test, vi } from 'vitest'
import type { StartState } from '../src/shared/model'
import { emptyChanges, everything } from '../src/shared/sync'
import { createApp, type Store } from './app'

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const state = (): StartState => ({
  artists: { [id(4)]: { id: id(4), name: 'Radiohead' } },
  albums: { [id(2)]: { id: id(2), name: 'Kid A', image: 'https://i.scdn.co/image/x', vendor: { name: 'spotify', id: 'abc' },
    artistId: id(4), year: 2000, tracklistLoaded: true, stagedAt: 1, addedAt: 2 } },
  tracks: { [id(3)]: { id: id(3), name: 'Idioteque', albumId: id(2), artistId: id(4), disc: 1, number: 1, durationMs: 1000,
    score: 73, branch: { angle: Math.PI / 2, length: 1.25, ring: 0 }, since: 2 } },
  movies: { [id(5)]: { id: id(5), name: 'Stalker', score: 90, branch: { angle: 0, length: 1.25, ring: 0 }, since: 3 } },
  books: {},
  artistInfo: {},
  next: null,
})

const fakeStore = (): Store & { applied: unknown[] } => {
  const applied: unknown[] = []
  return {
    applied, load: vi.fn(async () => state()), apply: vi.fn(async (c) => { applied.push(c) }),
    loadArtists: vi.fn(async () => ({ albums: state().albums, tracks: state().tracks })),
    near: vi.fn(async () => Object.values(state().tracks)),
    counts: vi.fn(async () => ({ artists: 1, albums: 1, songs: 1 })),
    artistPage: vi.fn(async (after: string) => after === 'good' ? { artists: state().artists, artistInfo: {}, next: null } : undefined),
    findArtists: vi.fn(async () => ({ artists: state().artists, artistInfo: {} })),
  }
}

const post = (app: ReturnType<typeof createApp>, body: unknown) =>
  app.request('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

describe('state and sync routes', () => {
  test('GET /api/state returns what the store loads', async () => {
    const app = createApp({ spotify: null, store: fakeStore() })
    expect(await (await app.request('/api/state')).json()).toEqual(state())
  })

  test('POST /api/sync validates and applies a batch', async () => {
    const store = fakeStore()
    const app = createApp({ spotify: null, store })
    const res = await post(app, everything(state()))
    expect(res.status).toBe(200)
    expect(store.applied).toHaveLength(1)
  })

  test('accepts an uploaded cover (a base64 JPEG data: URL)', async () => {
    const store = fakeStore()
    const app = createApp({ spotify: null, store })
    const track = { id: id(9), name: 'Demo', image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' }
    expect((await post(app, { ...emptyChanges(), upsert: { ...emptyChanges().upsert, tracks: [track] } })).status).toBe(200)
  })

  test('rejects malformed batches before they reach the database', async () => {
    const store = fakeStore()
    const app = createApp({ spotify: null, store })
    const bad = [
      'not json at all',
      { upsert: {}, remove: {} },
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, tracks: [{ id: 'not-a-uuid', name: 'x' }] } },
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, tracks: [{ id: id(9), name: 'x', branch: { angle: 0, length: 1 } }] } }, // half a branch
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, tracks: [{ id: id(9), name: 'x', score: 120 }] } }, // score past 100
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, albums: [{ id: id(9), name: 'x', image: 'javascript:alert(1)', tracklistLoaded: false, stagedAt: 1 }] } },
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, albums: [{ id: id(9), name: 'x', tracklistLoaded: false }] } }, // no stagedAt
      // pictures: only base64 JPEG, PNG or WebP, and not too big
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, tracks: [{ id: id(9), name: 'x', image: 'data:image/svg+xml;base64,PHN2Zz4=' }] } },
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, tracks: [{ id: id(9), name: 'x', image: 'data:text/html;base64,PGI+' }] } },
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, tracks: [{ id: id(9), name: 'x', image: `data:image/jpeg;base64,${'A'.repeat(400_000)}` }] } },
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, tracks: [{ id: id(9), name: 'x', albumId: 'not-a-uuid' }] } },
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, movies: [{ id: id(9), name: 'x', colors: ['red'] }] } },
    ]
    for (const body of bad) expect((await post(app, body)).status).toBe(400)
    expect(store.applied).toHaveLength(0)
  })

  test('503 when there is no database, or it fails', async () => {
    const none = createApp({ spotify: null, store: null })
    expect((await none.request('/api/state')).status).toBe(503)
    expect((await post(none, emptyChanges())).status).toBe(503)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const down = async () => { throw new Error('down') }
    const broken = createApp({ spotify: null, store: { load: down, apply: down, loadArtists: down, near: down, counts: down, artistPage: down, findArtists: down } })
    expect((await broken.request('/api/state')).status).toBe(503)
    expect((await broken.request('/api/counts')).status).toBe(503)
    expect((await broken.request(`/api/library/artists?ids=${id(4)}`)).status).toBe(503)
    expect((await broken.request('/api/library/tracks/near?score=50')).status).toBe(503)
    expect((await broken.request('/api/library/artists/page?after=good')).status).toBe(503)
    expect((await broken.request('/api/library/artists/find?q=ra')).status).toBe(503)
    expect((await post(broken, emptyChanges())).status).toBe(503)
  })

  test('artist pages: the next page after a valid cursor; anything else is refused', async () => {
    const store = fakeStore()
    const app = createApp({ spotify: null, store })
    expect(await (await app.request('/api/library/artists/page?after=good')).json()).toEqual({ artists: state().artists, artistInfo: {}, next: null })
    expect((await app.request('/api/library/artists/page?after=bad')).status).toBe(400)
    expect((await app.request('/api/library/artists/page')).status).toBe(400)
  })

  test('artist lookups: by Spotify id, name or search, validated first', async () => {
    const store = fakeStore()
    const app = createApp({ spotify: null, store })
    const spotifyId = '4Z8W4fKeB5YxbusRsdQVPb'
    expect((await app.request(`/api/library/artists/find?vendor=${spotifyId}&name=Radiohead&name=Nina%2C%20Simone&q=ra`)).status).toBe(200)
    expect(store.findArtists).toHaveBeenCalledWith({ vendorIds: [spotifyId], names: ['Radiohead', 'Nina, Simone'], q: 'ra' })
    for (const bad of ['', '?vendor=not-spotify', `?name=${'x'.repeat(201)}`, `?q=${'x'.repeat(101)}`]) {
      expect((await app.request(`/api/library/artists/find${bad}`)).status).toBe(400)
    }
    expect(store.findArtists).toHaveBeenCalledTimes(1)
  })

  test('GET /api/counts returns what the store counts', async () => {
    const app = createApp({ spotify: null, store: fakeStore() })
    expect(await (await app.request('/api/counts')).json()).toEqual({ artists: 1, albums: 1, songs: 1 })
  })

  test('GET /api/library/artists loads the artists asked for, after checking their ids', async () => {
    const store = fakeStore()
    const app = createApp({ spotify: null, store })
    const res = await app.request(`/api/library/artists?ids=${id(4)},${id(7)}`)
    expect(res.status).toBe(200)
    expect(store.loadArtists).toHaveBeenCalledWith([id(4), id(7)])
    expect(Object.keys((await res.json()).tracks)).toEqual([id(3)])
    for (const q of ['', '?ids=', '?ids=nope', `?ids=${id(4)},x`]) expect((await app.request(`/api/library/artists${q}`)).status).toBe(400)
    expect(store.loadArtists).toHaveBeenCalledTimes(1)
  })

  test('GET /api/library/tracks/near checks its query', async () => {
    const store = fakeStore()
    const app = createApp({ spotify: null, store })
    const res = await app.request(`/api/library/tracks/near?score=73&exclude=${id(9)}`)
    expect(res.status).toBe(200)
    expect(store.near).toHaveBeenCalledWith(73, 2, [id(9)], 5)
    for (const q of ['', 'score=x', 'score=101', 'score=50&range=99', 'score=50&limit=0', 'score=50&exclude=x'])
      expect((await app.request(`/api/library/tracks/near?${q}`)).status).toBe(400)
  })

  test('responses are gzipped when the client accepts it', async () => {
    const app = createApp({ spotify: null, store: fakeStore() })
    const res = await app.request('/api/library/tracks/near?score=73', { headers: { 'Accept-Encoding': 'gzip' } })
    expect(res.headers.get('Content-Encoding')).toBe('gzip')
  })
})
