import { describe, expect, test, vi } from 'vitest'
import { createApp } from './app'
import type { Suggestion } from '../src/shared/suggestions'
import { createSpotify, mergeByRelevance, pickImage } from './spotify'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const artist = (id: string, name: string, genres: string[] = []) => ({
  id, name, genres,
  images: [{ url: `${id}-640`, width: 640, height: 640 }, { url: `${id}-320`, width: 320, height: 320 }, { url: `${id}-64`, width: 64, height: 64 }],
})

/** Fake Spotify: counts token requests, can expire tokens, answers searches. */
const fakeSpotify = (opts: { rejectFirstSearch?: boolean } = {}) => {
  let tokens = 0
  let searches = 0
  const fetch = vi.fn(async (url: string | URL | Request) => {
    const u = String(url)
    if (u.startsWith('https://accounts.spotify.com/api/token')) return json({ access_token: `t${++tokens}`, expires_in: 3600 })
    searches++
    if (opts.rejectFirstSearch && searches === 1) return json({ error: { status: 401 } }, 401)
    return json({
      artists: { items: [artist('rh', 'Radiohead', ['art rock', 'alternative rock', 'electronic']), artist('ty', 'Thom Yorke')] },
      albums: { items: [
        { ...artist('okc', 'OK Computer'), album_type: 'album', artists: [{ name: 'Radiohead' }], release_date: '1997-05-28' },
        { ...artist('crp', 'Creep'), album_type: 'single', artists: [{ name: 'Radiohead' }], release_date: '1992' },
      ] },
    })
  })
  return { fetch: fetch as unknown as typeof globalThis.fetch, tokens: () => tokens, calls: fetch.mock.calls }
}

describe('spotify client', () => {
  test('searches artists and albums together and maps both', async () => {
    const f = fakeSpotify()
    const results = await createSpotify({ clientId: 'id', clientSecret: 'secret', fetch: f.fetch }).searchMusic('zzz')
    expect(results).toEqual([
      { provider: 'spotify', kind: 'artist', id: 'rh', name: 'Radiohead', image: 'rh-64', detail: 'art rock · alternative rock' },
      { provider: 'spotify', kind: 'album', id: 'okc', name: 'OK Computer', image: 'okc-64', detail: 'Radiohead · 1997' },
      { provider: 'spotify', kind: 'artist', id: 'ty', name: 'Thom Yorke', image: 'ty-64', detail: undefined },
      { provider: 'spotify', kind: 'album', id: 'crp', name: 'Creep', image: 'crp-64', detail: 'Radiohead · 1992 · single' },
    ])
    const url = String(f.calls[1][0])
    expect(url).toContain('type=artist,album')
    expect(url).toContain('q=zzz')
  })

  test('reuses the token until near expiry, then fetches a new one', async () => {
    const f = fakeSpotify()
    let t = 0
    const spotify = createSpotify({ clientId: 'id', clientSecret: 'secret', fetch: f.fetch, now: () => t })
    await spotify.searchMusic('a'); await spotify.searchMusic('b')
    expect(f.tokens()).toBe(1)
    t = 3600_000 - 30_000 // inside the 60s safety margin
    await spotify.searchMusic('c')
    expect(f.tokens()).toBe(2)
  })

  test('concurrent searches share one token request', async () => {
    const f = fakeSpotify()
    const spotify = createSpotify({ clientId: 'id', clientSecret: 'secret', fetch: f.fetch })
    await Promise.all([spotify.searchMusic('a'), spotify.searchMusic('b'), spotify.searchMusic('c')])
    expect(f.tokens()).toBe(1)
  })

  test('a 401 gets a fresh token and retries once', async () => {
    const f = fakeSpotify({ rejectFirstSearch: true })
    const results = await createSpotify({ clientId: 'id', clientSecret: 'secret', fetch: f.fetch }).searchMusic('radioh')
    expect(results).toHaveLength(4)
    expect(f.tokens()).toBe(2)
  })

  test('sends the secret only to the token endpoint, as Basic auth', async () => {
    const f = fakeSpotify()
    await createSpotify({ clientId: 'id', clientSecret: 'secret', fetch: f.fetch }).searchMusic('x')
    const [tokenCall, searchCall] = f.calls as unknown as [string, RequestInit][]
    expect((tokenCall[1].headers as Record<string, string>).Authorization).toBe('Basic ' + Buffer.from('id:secret').toString('base64'))
    expect(JSON.stringify(searchCall)).not.toContain('secret')
  })

  test('pickImage falls back to the largest when none is big enough, and handles no images', () => {
    expect(pickImage([{ url: 's', width: 32, height: 32 }, { url: 'm', width: 48, height: 48 }])).toBe('m')
    expect(pickImage([])).toBeUndefined()
  })
})

describe('mergeByRelevance', () => {
  const sg = (kind: 'artist' | 'album', name: string): Suggestion => ({ provider: 'spotify', kind, id: `${kind}:${name}`, name })
  const names = (list: Suggestion[]) => list.map(x => `${x.kind}:${x.name}`)

  test('closer name matches first: exact, then starts-with, then contains, then the rest', () => {
    // the real "ok computer" response: Spotify puts Radiohead first among artists
    const artists = [sg('artist', 'Radiohead'), sg('artist', 'Ok Computer'), sg('artist', 'OK Go')]
    const albums = [sg('album', 'OK Computer'), sg('album', 'OK Computer OKNOTOK 1997 2017'), sg('album', 'Kid A'), sg('album', 'Lofi: OK Computer')]
    expect(names(mergeByRelevance('ok computer', artists, albums))).toEqual([
      'album:OK Computer', 'artist:Ok Computer',              // exact
      'album:OK Computer OKNOTOK 1997 2017',                  // starts with
      'album:Lofi: OK Computer',                              // contains
      'artist:Radiohead', 'artist:OK Go', 'album:Kid A',      // the rest, by position in Spotify's lists (1st artist, 3rd artist, 3rd album)
    ])
  })

  test('equal matches alternate artist, album in Spotify order', () => {
    expect(names(mergeByRelevance('x', [sg('artist', 'a1'), sg('artist', 'a2')], [sg('album', 'b1'), sg('album', 'b2'), sg('album', 'b3')])))
      .toEqual(['artist:a1', 'album:b1', 'artist:a2', 'album:b2', 'album:b3'])
  })

  test('caps the list', () => {
    const many = Array.from({ length: 10 }, (_, i) => sg('artist', `a${i}`))
    expect(mergeByRelevance('x', many, many.map(a => ({ ...a, kind: 'album' as const })), 8)).toHaveLength(8)
  })
})

describe('api', () => {
  const spotifyStub = { searchMusic: vi.fn(async (q: string): Promise<Suggestion[]> => [{ provider: 'spotify', kind: 'artist', id: '1', name: q }]) }
  const app = createApp({ spotify: spotifyStub })

  test('music suggestions come from Spotify', async () => {
    const res = await app.request('/api/suggestions/music?q=%20radioh%20')
    expect(await res.json()).toEqual({ supported: true, results: [{ provider: 'spotify', kind: 'artist', id: '1', name: 'radioh' }] })
  })

  test('very short queries return nothing without calling Spotify', async () => {
    spotifyStub.searchMusic.mockClear()
    expect(await (await app.request('/api/suggestions/music?q=r')).json()).toEqual({ supported: true, results: [] })
    expect(spotifyStub.searchMusic).not.toHaveBeenCalled()
  })

  test('other types have no catalogue yet', async () => {
    expect(await (await app.request('/api/suggestions/books?q=dune')).json()).toEqual({ supported: false, results: [] })
  })

  test('503 when Spotify is not configured, 502 when it fails', async () => {
    expect((await createApp({ spotify: null }).request('/api/suggestions/music?q=radioh')).status).toBe(503)
    const failing = createApp({ spotify: { searchMusic: async () => { throw new Error('down') } } })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await failing.request('/api/suggestions/music?q=radioh')).status).toBe(502)
  })
})
