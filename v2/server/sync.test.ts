import { describe, expect, test, vi } from 'vitest'
import type { Persisted } from '../src/shared/model'
import { emptyChanges, everything } from '../src/shared/sync'
import { createApp, type Store } from './app'

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const state = (): Persisted => ({
  types: { music: { id: 'music', name: 'MUSIC', builtIn: true } },
  boards: { [id(1)]: { id: id(1), typeId: 'music', name: 'MUSIC', axis: 'linear', bands: [] } },
  items: {
    [id(2)]: { id: id(2), typeId: 'music', name: 'Kid A', image: 'https://i.scdn.co/image/x', artist: 'Radiohead', year: 2000,
      source: { provider: 'spotify', kind: 'album', id: 'abc' }, tracks: [{ id: 't1', name: 'Idioteque', number: 1, disc: 1, durationMs: 1000 }] },
    [id(3)]: { id: id(3), typeId: 'music', name: 'Idioteque', albumId: id(2) },
  },
  staged: [], added: [{ boardId: id(1), itemId: id(2), stagedAt: 1 }],
  placements: [{ boardId: id(1), itemId: id(3), position: 0.73, placedAt: 2, angle: Math.PI / 2, length: 1.25, ring: 0 }],
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
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, items: [{ id: 'not-a-uuid', typeId: 'music', name: 'x' }] } },
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, boardItems: [{ boardId: id(1), itemId: id(3), status: 'placed', since: 1 }] } }, // placed without branch
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, boardItems: [{ boardId: id(1), itemId: id(3), status: 'placed', since: 1, position: 1.5, angle: 0, length: 1, ring: 0 }] } },
      { ...emptyChanges(), upsert: { ...emptyChanges().upsert, items: [{ id: id(9), typeId: 'music', name: 'x', image: 'javascript:alert(1)' }] } },
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
