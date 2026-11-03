import type { Suggestion } from '../src/shared/suggestions'

/**
 * Minimal Spotify Web API client using the client-credentials flow (app token, no user login).
 * Same flow as v1's SpotifyApi.kt: request a token with the client id + secret, cache it until
 * shortly before it expires, request a new one.
 */
export type SpotifyConfig = {
  clientId: string
  clientSecret: string
  fetch?: typeof fetch
  now?: () => number
}

type SpotifyImage = { url: string, width: number | null, height: number | null }
type SpotifyArtist = { id: string, name: string, genres?: string[], images?: SpotifyImage[] }
type SpotifyAlbum = {
  id: string
  name: string
  album_type?: 'album' | 'single' | 'compilation'
  artists?: { name: string }[]
  release_date?: string
  images?: SpotifyImage[]
}

/** Refresh this long before the token's stated expiry, so in-flight requests never use a stale one. */
const EXPIRY_MARGIN_MS = 60_000

/** Smallest image that's still at least `min` px wide (Spotify lists largest first). */
export const pickImage = (images: SpotifyImage[] = [], min = 64): string | undefined => {
  const bySize = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
  return (bySize.find(i => (i.width ?? 0) >= min) ?? bySize[bySize.length - 1])?.url
}

/** How well a name matches the query: exact, starts with it, contains it, or neither (Spotify's own relevance). */
const matchRank = (name: string, query: string) => {
  const n = name.toLowerCase(), q = query.trim().toLowerCase()
  return n === q ? 0 : n.startsWith(q) ? 1 : n.includes(q) ? 2 : 3
}

/**
 * Merges Spotify's separate artist and album lists into one: closer name matches first, and within the same
 * closeness artists and albums alternate in Spotify's own order. Stable, so Spotify's relevance breaks ties.
 */
export const mergeByRelevance = (query: string, artists: Suggestion[], albums: Suggestion[], limit = 8): Suggestion[] => {
  const interleaved: Suggestion[] = []
  for (let i = 0; i < Math.max(artists.length, albums.length); i++) {
    if (artists[i]) interleaved.push(artists[i])
    if (albums[i]) interleaved.push(albums[i])
  }
  return interleaved
    .map((sg, order) => ({ sg, order, rank: matchRank(sg.name, query) }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, limit)
    .map(x => x.sg)
}

const artistSuggestion = (a: SpotifyArtist): Suggestion => ({
  provider: 'spotify',
  kind: 'artist',
  id: a.id,
  name: a.name,
  image: pickImage(a.images),
  detail: a.genres?.slice(0, 2).join(' · ') || undefined,
})

const albumSuggestion = (a: SpotifyAlbum): Suggestion => ({
  provider: 'spotify',
  kind: 'album',
  id: a.id,
  name: a.name,
  image: pickImage(a.images),
  detail: [a.artists?.map(x => x.name).join(', '), a.release_date?.slice(0, 4), a.album_type && a.album_type !== 'album' ? a.album_type : undefined]
    .filter(Boolean).join(' · ') || undefined,
})

export const createSpotify = ({ clientId, clientSecret, fetch: f = fetch, now = Date.now }: SpotifyConfig) => {
  let token: { value: string, expiresAt: number } | null = null
  let pending: Promise<string> | null = null

  const requestToken = async (): Promise<string> => {
    const res = await f('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    if (!res.ok) throw new Error(`Spotify token request failed: ${res.status}`)
    const body = await res.json() as { access_token: string, expires_in: number }
    token = { value: body.access_token, expiresAt: now() + body.expires_in * 1000 - EXPIRY_MARGIN_MS }
    return token.value
  }

  /** One shared token request at a time, even if many searches arrive together. */
  const getToken = async () => {
    if (token && now() < token.expiresAt) return token.value
    pending ??= requestToken().finally(() => { pending = null })
    return pending
  }

  /** Artists and albums matching free text, merged into one list (see mergeByRelevance). */
  const searchMusic = async (query: string, limit = 8): Promise<Suggestion[]> => {
    const url = `https://api.spotify.com/v1/search?type=artist,album&limit=6&q=${encodeURIComponent(query)}`
    let res = await f(url, { headers: { Authorization: `Bearer ${await getToken()}` } })
    if (res.status === 401) { // token revoked or expired early: get a fresh one and retry once
      token = null
      res = await f(url, { headers: { Authorization: `Bearer ${await getToken()}` } })
    }
    if (!res.ok) throw new Error(`Spotify search failed: ${res.status}`)
    const body = await res.json() as { artists?: { items: SpotifyArtist[] }, albums?: { items: SpotifyAlbum[] } }
    return mergeByRelevance(
      query,
      (body.artists?.items ?? []).map(artistSuggestion),
      (body.albums?.items ?? []).map(albumSuggestion),
      limit,
    )
  }

  return { searchMusic }
}
