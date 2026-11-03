import { Hono } from 'hono'
import type { Persisted } from '../src/shared/model'
import type { SuggestionsResponse } from '../src/shared/suggestions'
import type { Changes } from '../src/shared/sync'
import { changesSchema } from './schema'
import { NotFoundError, type createSpotify } from './spotify'

/** Where boards and items are saved (Postgres in production, a fake in tests). Null: saving is unavailable. */
export type Store = { load: () => Promise<Persisted>, apply: (c: Changes) => Promise<void> }

type Deps = { spotify: ReturnType<typeof createSpotify> | null, store?: Store | null }

/** Shortest query worth sending to a catalogue. */
const MIN_QUERY = 2
const MAX_QUERY = 100
/** Spotify ids are 22 base-62 characters; anything else is rejected before it reaches Spotify. */
const SPOTIFY_ID = /^[0-9A-Za-z]{22}$/

/**
 * The API: looks things up in outside catalogues, and saves boards and items to the database.
 *   GET /api/health
 *   GET /api/suggestions/:typeId?q=…   (only MUSIC has a catalogue so far: Spotify artists and albums)
 *   GET /api/music/albums/:id           an album with its tracklist
 *   GET /api/state                      everything saved (types, boards, items, and what's on each board)
 *   POST /api/sync                      a batch of upserts and deletes (shared/sync.ts `Changes`), one transaction
 */
export const createApp = ({ spotify, store = null }: Deps) => {
  const app = new Hono()

  app.get('/api/health', c => c.json({ ok: true, spotify: spotify !== null, database: store !== null }))

  app.get('/api/state', async c => {
    if (!store) return c.json({ error: 'The database is not configured on the server' }, 503)
    try {
      return c.json(await store.load())
    } catch (e) {
      console.error(e)
      return c.json({ error: 'Could not read from the database' }, 503)
    }
  })

  app.post('/api/sync', async c => {
    if (!store) return c.json({ error: 'The database is not configured on the server' }, 503)
    const body = await c.req.json().catch(() => undefined)
    const parsed = changesSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: 'Invalid changes', issues: parsed.error.issues.slice(0, 10) }, 400)
    try {
      await store.apply(parsed.data as Changes)
      return c.json({ ok: true })
    } catch (e) {
      console.error(e)
      return c.json({ error: 'Could not save to the database' }, 503)
    }
  })

  app.get('/api/suggestions/:typeId', async c => {
    const q = (c.req.query('q') ?? '').trim().slice(0, MAX_QUERY)
    if (c.req.param('typeId') !== 'music') return c.json<SuggestionsResponse>({ supported: false, results: [] })
    if (!spotify) return c.json({ error: 'Spotify is not configured on the server' }, 503)
    if (q.length < MIN_QUERY) return c.json<SuggestionsResponse>({ supported: true, results: [] })
    try {
      return c.json<SuggestionsResponse>({ supported: true, results: await spotify.searchMusic(q) })
    } catch (e) {
      console.error(e)
      return c.json({ error: 'Spotify search failed' }, 502)
    }
  })

  app.get('/api/music/albums/:id', async c => {
    const id = c.req.param('id')
    if (!SPOTIFY_ID.test(id)) return c.json({ error: 'Not a Spotify album id' }, 400)
    if (!spotify) return c.json({ error: 'Spotify is not configured on the server' }, 503)
    try {
      return c.json(await spotify.getAlbum(id))
    } catch (e) {
      if (e instanceof NotFoundError) return c.json({ error: 'Album not found' }, 404)
      console.error(e)
      return c.json({ error: 'Spotify request failed' }, 502)
    }
  })

  return app
}
