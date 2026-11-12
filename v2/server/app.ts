import { Hono } from 'hono'
import { compress } from 'hono/compress'
import type { ArtistLibrary, ArtistPage, ArtistQuery, MusicCounts, NearTrack, StartState } from '../src/shared/model'
import type { SuggestionsResponse } from '../src/shared/suggestions'
import type { Changes } from '../src/shared/sync'
import { changesSchema } from './schema'
import { NotFoundError, type createSpotify } from './spotify'

/** Where boards and items are saved (Postgres in production, a fake in tests). Null: saving is unavailable. */
export type Store = {
  load: () => Promise<StartState>
  loadArtists: (ids: string[]) => Promise<ArtistLibrary>
  /** The page of artists after this cursor (an ArtistPage's `next`); undefined if the cursor isn't a valid one. */
  artistPage: (after: string) => Promise<ArtistPage | undefined>
  findArtists: (q: ArtistQuery) => Promise<Omit<ArtistPage, 'next'>>
  near: (score: number, range: number, exclude: string[], limit: number) => Promise<NearTrack[]>
  counts: () => Promise<MusicCounts>
  apply: (c: Changes) => Promise<void>
}

type Deps = { spotify: ReturnType<typeof createSpotify> | null, store?: Store | null }

/** Shortest query worth sending to a catalogue. */
const MIN_QUERY = 2
const MAX_QUERY = 100
/** Spotify ids are 22 base-62 characters; anything else is rejected before it reaches Spotify. */
const SPOTIFY_ID = /^[0-9A-Za-z]{22}$/
/** Our own ids. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Most artists one library request may ask for. */
const MAX_ARTISTS = 500
/** Near-score lookups: how far either side, and how many. */
const MAX_RANGE = 10, MAX_NEAR = 20
/** Artist lookups: most ids or names one may ask for, and their longest name or search. */
const MAX_FIND = 50, MAX_NAME = 200

const ids = (raw: string | undefined) => (raw ?? '').split(',').filter(Boolean)

const noDatabase = { error: 'The database is not configured on the server' }

/**
 * The API: looks things up in outside catalogues, and saves boards and items to the database.
 *   GET /api/health
 *   GET /api/suggestions/:typeId?q=…   (only MUSIC has a catalogue so far: Spotify artists and albums)
 *   GET /api/music/albums/:id           an album with its tracklist
 *   GET /api/state                      what the app starts with (shared/model.ts StartState): the first page of
 *                                       artists with a summary each, movies, books, and the albums and tracks that belong to no artist
 *   GET /api/library/artists?ids=…      those artists' albums and tracks (ArtistLibrary), loaded when they're needed
 *   GET /api/library/artists/page?after=…   the next page of artists (ArtistPage) after a page's `next`
 *   GET /api/library/artists/find?vendor=…&name=…&q=…   artists by Spotify id (repeatable), exact name (repeatable),
 *                                       or name containing q, with a summary each
 *   GET /api/library/tracks/near?score=&range=&limit=&exclude=…   rated tracks at or near a score (NearTrack[])
 *   GET /api/counts                     how many artists, albums (Misc aside) and songs are saved (MusicCounts)
 *   POST /api/sync                      a batch of upserts and deletes (shared/sync.ts `Changes`), one transaction
 */
export const createApp = ({ spotify, store = null }: Deps) => {
  const app = new Hono()
  app.use('/api/*', compress())

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

  app.get('/api/library/artists', async c => {
    if (!store) return c.json({ error: 'The database is not configured on the server' }, 503)
    const list = ids(c.req.query('ids'))
    if (list.length === 0 || list.length > MAX_ARTISTS || !list.every(id => UUID.test(id))) return c.json({ error: 'Invalid artist ids' }, 400)
    try {
      return c.json(await store.loadArtists(list))
    } catch (e) {
      console.error(e)
      return c.json({ error: 'Could not read from the database' }, 503)
    }
  })

  app.get('/api/library/artists/page', async c => {
    if (!store) return c.json(noDatabase, 503)
    const after = c.req.query('after') ?? ''
    if (!after || after.length > 1000) return c.json({ error: 'Invalid cursor' }, 400)
    try {
      const page = await store.artistPage(after)
      return page ? c.json(page) : c.json({ error: 'Invalid cursor' }, 400)
    } catch (e) {
      console.error(e)
      return c.json({ error: 'Could not read from the database' }, 503)
    }
  })

  app.get('/api/library/artists/find', async c => {
    if (!store) return c.json(noDatabase, 503)
    const vendorIds = c.req.queries('vendor') ?? [], names = (c.req.queries('name') ?? []).map(n => n.trim()).filter(Boolean)
    const q = (c.req.query('q') ?? '').trim()
    if (vendorIds.length > MAX_FIND || !vendorIds.every(id => SPOTIFY_ID.test(id)) || names.length > MAX_FIND
      || names.some(n => n.length > MAX_NAME) || q.length > MAX_QUERY || (!vendorIds.length && !names.length && !q)) {
      return c.json({ error: 'Invalid query' }, 400)
    }
    try {
      return c.json(await store.findArtists({ vendorIds, names, ...(q ? { q } : {}) }))
    } catch (e) {
      console.error(e)
      return c.json({ error: 'Could not read from the database' }, 503)
    }
  })

  app.get('/api/library/tracks/near', async c => {
    if (!store) return c.json({ error: 'The database is not configured on the server' }, 503)
    const score = Number(c.req.query('score')), range = Number(c.req.query('range') ?? 2), limit = Number(c.req.query('limit') ?? 5)
    const exclude = ids(c.req.query('exclude'))
    if (!Number.isFinite(score) || score < 0 || score > 100 || !Number.isInteger(range) || range < 0 || range > MAX_RANGE
      || !Number.isInteger(limit) || limit < 1 || limit > MAX_NEAR || exclude.length > MAX_ARTISTS || !exclude.every(id => UUID.test(id))) {
      return c.json({ error: 'Invalid query' }, 400)
    }
    try {
      return c.json({ tracks: await store.near(score, range, exclude, limit) })
    } catch (e) {
      console.error(e)
      return c.json({ error: 'Could not read from the database' }, 503)
    }
  })

  app.get('/api/counts', async c => {
    if (!store) return c.json({ error: 'The database is not configured on the server' }, 503)
    try {
      return c.json(await store.counts())
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

  app.get('/api/music/artists/:id/albums', async c => {
    const id = c.req.param('id')
    if (!SPOTIFY_ID.test(id)) return c.json({ error: 'Not a Spotify artist id' }, 400)
    if (!spotify) return c.json({ error: 'Spotify is not configured on the server' }, 503)
    try {
      return c.json({ albums: await spotify.getArtistAlbums(id) })
    } catch (e) {
      if (e instanceof NotFoundError) return c.json({ error: 'Artist not found' }, 404)
      console.error(e)
      return c.json({ error: 'Spotify request failed' }, 502)
    }
  })

  return app
}
