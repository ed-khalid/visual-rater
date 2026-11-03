import { Hono } from 'hono'
import type { SuggestionsResponse } from '../src/shared/suggestions'
import type { createSpotify } from './spotify'

type Deps = { spotify: ReturnType<typeof createSpotify> | null }

/** Shortest query worth sending to a catalogue. */
const MIN_QUERY = 2
const MAX_QUERY = 100

/**
 * The API. Stateless: it only looks things up in outside catalogues. Boards and items stay in the browser.
 *   GET /api/health
 *   GET /api/suggestions/:typeId?q=…   (only MUSIC has a catalogue so far: Spotify artists and albums)
 */
export const createApp = ({ spotify }: Deps) => {
  const app = new Hono()

  app.get('/api/health', c => c.json({ ok: true, spotify: spotify !== null }))

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

  return app
}
