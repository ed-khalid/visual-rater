import { describe, expect, test, vi } from 'vitest'
import type { Persisted } from '../src/shared/model'
import { emptyChanges, everything } from '../src/shared/sync'
import { createApp, type Store } from './app'

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const state = (): Persisted => ({
  artists: { [id(4)]: { id: id(4), name: 'Radiohead' } },
  albums: { [id(2)]: { id: id(2), name: 'Kid A', image: 'https://i.scdn.co/image/x', vendor: { name: 'spotify', id: 'abc' },
    artistId: id(4), year: 2000, tracklistLoaded: true, stagedAt: 1, addedAt: 2 } },
  tracks: { [id(3)]: { id: id(3), name: 'Idioteque', albumId: id(2), artistId: id(4), disc: 1, number: 1, durationMs: 1000,
    score: 73, branch: { angle: Math.PI / 2, length: 1.25, ring: 0 }, since: 2 } },
  movies: { [id(5)]: { id: id(5), name: 'Stalker', score: 90, branch: { angle: 0, length: 1.25, ring: 0 }, since: 3 } },
  books: {},
})

const fakeStore = (): Store & { applied: unknown[] } => {
  const applied: unknown[] = []
  return { applied, load: vi.fn(async () => state()), apply: vi.fn(async (c) => { applied.push(c) }) }
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
    const broken = createApp({ spotify: null, store: { load: async () => { throw new Error('down') }, apply: async () => { throw new Error('down') } } })
    expect((await broken.request('/api/state')).status).toBe(503)
    expect((await post(broken, emptyChanges())).status).toBe(503)
  })
})
