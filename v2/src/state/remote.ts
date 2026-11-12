import { create } from 'zustand'
import { type ArtistLibrary, type ArtistPage, type ArtistQuery, COLLECTIONS, type MusicCounts, type Persisted, type StartState, TYPES, type TypeId } from '../shared/model'
import { type Changes, diffState, isEmpty, mergeChanges } from '../shared/sync'
import { type ArtistRef, matchArtist, type State, useStore } from './store'

/**
 * Keeps the store and the database in step. On startup, loads GET /api/state: the first page of artists (best first)
 * with a summary of each (artistInfo), but none of their albums or tracks; those load per artist when something needs
 * them (loadArtists). More artists come a page at a time as the catalog scrolls (loadMoreArtists), or when something
 * looks one up (findArtists: the ADD palette, the typed-song form), so an artist is never added twice.
 * After that, every
 * change to the store is turned into a batch of upserts/deletes (shared/sync.ts) and sent to POST /api/sync,
 * debounced, one request at a time; failed saves are kept, merged with newer ones, and retried with backoff.
 */

export type SyncStatus = 'loading' | 'offline' | 'ready'

type Sync = {
  status: SyncStatus
  /** True while changes are waiting to be saved or being sent. */
  saving: boolean
  /** Set when the last save failed (it will be retried). */
  error: string | null
}

export const useSync = create<Sync>()(() => ({ status: 'loading', saving: false, error: null }))

/** How many artists, albums and songs the database holds (GET /api/counts): asked for at startup and after each save. */
export const useCounts = create<{ music: MusicCounts | null }>()(() => ({ music: null }))

let countsAsked = 0
export const refreshCounts = async () => {
  const asked = ++countsAsked
  try {
    const res = await fetch('/api/counts')
    if (!res.ok) return
    const music = await res.json() as MusicCounts
    // an older answer arriving late doesn't overwrite a newer one
    if (asked === countsAsked) useCounts.setState({ music })
  } catch { /* keeps the last counts */ }
}

/** Paging through the artists: where the next page starts (null: no more), and whether it's being loaded. */
export const useArtistPages = create<{ next: string | null, loading: boolean }>()(() => ({ next: null, loading: false }))

/** UI-only state kept in the browser, not the database: which type's tree was open. */
const UI_KEY = 'visual-rater-v2.ui'

const DEBOUNCE_MS = 250
const MAX_RETRY_MS = 30_000

const persistedOf = (s: Persisted): Persisted =>
  ({ artists: s.artists, albums: s.albums, tracks: s.tracks, movies: s.movies, books: s.books })

const sameRefs = (a: Persisted, b: Persisted) => COLLECTIONS.every(k => a[k] === b[k])

let synced: Persisted | null = null
let queue: Changes | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let inFlight = false
let retryMs = 1000
let unsubscribe: (() => void) | null = null
/** Ids deleted in this session: if a late load brings one back, it stays deleted. */
const removed = new Set<string>()
/** Artists being loaded. */
const loading = new Map<string, Promise<void>>()

const post = async (c: Changes) => {
  const res = await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) })
  if (!res.ok) throw new Error(`save failed (${res.status})`)
}

const schedule = (ms: number) => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { timer = null; void flush() }, ms)
}

const flush = async () => {
  if (inFlight || !queue) return
  const batch = queue
  queue = null
  inFlight = true
  try {
    await post(batch)
    retryMs = 1000
    useSync.setState({ error: null })
    void refreshCounts()
  } catch (e) {
    // Keep it, with anything newer folded in, and try again later.
    queue = queue ? mergeChanges(batch, queue) : batch
    useSync.setState({ error: e instanceof Error ? e.message : 'save failed' })
    schedule(retryMs)
    retryMs = Math.min(retryMs * 2, MAX_RETRY_MS)
  } finally {
    inFlight = false
    if (queue && !timer) schedule(DEBOUNCE_MS)
    useSync.setState({ saving: queue !== null })
  }
}

const onChange = (state: State, prev: State) => {
  if (state.activeType !== prev.activeType) {
    try { localStorage.setItem(UI_KEY, JSON.stringify({ activeType: state.activeType })) } catch { /* private mode */ }
  }
  if (!synced || sameRefs(state, synced)) return
  const next = persistedOf(state)
  const changes = diffState(synced, next)
  synced = next
  for (const k of COLLECTIONS) for (const id of changes.remove[k]) removed.add(id)
  if (isEmpty(changes)) return
  queue = queue ? mergeChanges(queue, changes) : changes
  useSync.setState({ saving: true })
  schedule(DEBOUNCE_MS)
}

/** Last-chance save when the page is closed with changes still waiting. */
const onPageHide = () => {
  if (!queue) return
  navigator.sendBeacon?.('/api/sync', new Blob([JSON.stringify(queue)], { type: 'application/json' }))
}

/** Loads the saved state into the store and starts saving changes. Safe to call again after going offline. */
export const startSync = async (): Promise<void> => {
  useSync.setState({ status: 'loading', error: null })
  let remote: StartState
  try {
    const res = await fetch('/api/state')
    if (!res.ok) throw new Error(String(res.status))
    remote = await res.json() as StartState
  } catch {
    useSync.setState({ status: 'offline' })
    return
  }

  let activeType: TypeId | null = null
  try {
    const saved = (JSON.parse(localStorage.getItem(UI_KEY) ?? '{}') as { activeType?: string }).activeType
    if (TYPES.some(t => t.id === saved)) activeType = saved as TypeId
  } catch { /* ignore */ }
  loading.clear(); removed.clear(); asked.clear()
  const { next, ...state } = remote
  useArtistPages.setState({ next: next ?? null, loading: false })
  useStore.setState({ ...state, artistInfo: remote.artistInfo ?? {}, activeType })
  synced = persistedOf(useStore.getState())
  unsubscribe?.()
  unsubscribe = useStore.subscribe(onChange)
  window.removeEventListener('pagehide', onPageHide)
  window.addEventListener('pagehide', onPageHide)
  useSync.setState({ status: 'ready' })
  void refreshCounts()
}

/**
 * Loads some artists' albums and tracks (GET /api/library/artists) if they aren't here yet, and adds them to the
 * store as already saved, so nothing is sent back. Anything already in the store (changed since, or added in this
 * session) or deleted in this session is kept as it is. Each artist loads once; a failed load is tried again the
 * next time it's asked for. Resolves when they're all in (or have failed).
 */
export const loadArtists = (ids: Iterable<string>): Promise<void> => {
  const info = useStore.getState().artistInfo
  const wanted = [...new Set(ids)].filter(id => info[id])
  const fresh = wanted.filter(id => !loading.has(id))
  if (fresh.length) {
    const load = fetch(`/api/library/artists?ids=${fresh.join(',')}`)
      .then(async res => {
        if (!res.ok) throw new Error(String(res.status))
        merge(fresh, await res.json() as ArtistLibrary)
      })
      .catch(() => { /* tried again next time */ })
      .finally(() => { for (const id of fresh) loading.delete(id) })
    for (const id of fresh) loading.set(id, load)
  }
  return Promise.all(wanted.map(id => loading.get(id))).then(() => {})
}

const merge = (artistIds: string[], lib: ArtistLibrary) => {
  if (!synced) return
  const st = useStore.getState()
  const add = <T>(local: Record<string, T>, remote: Record<string, T>) => {
    const fresh = Object.entries(remote).filter(([id]) => !(id in local) && !removed.has(id))
    return fresh.length ? { ...local, ...Object.fromEntries(fresh) } : local
  }
  const albums = add(st.albums, lib.albums), tracks = add(st.tracks, lib.tracks)
  const artistInfo = { ...st.artistInfo }
  for (const id of artistIds) delete artistInfo[id]
  // The store and the last saved state get the same records, so the change isn't seen as something to save.
  synced = { ...synced, albums, tracks }
  useStore.setState({ albums, tracks, artistInfo })
}

/**
 * Adds artists (with their summaries) to the store as already saved, like merge. One that's already here (loaded,
 * changed or added in this session) or was deleted in this session is kept as it is.
 */
const mergeArtists = (page: Omit<ArtistPage, 'next'>) => {
  if (!synced) return
  const st = useStore.getState()
  const fresh = Object.keys(page.artists).filter(id => !(id in st.artists) && !removed.has(id))
  if (!fresh.length) return
  const artists = { ...st.artists, ...Object.fromEntries(fresh.map(id => [id, page.artists[id]])) }
  const artistInfo = { ...st.artistInfo, ...Object.fromEntries(fresh.flatMap(id => page.artistInfo[id] ? [[id, page.artistInfo[id]]] : [])) }
  synced = { ...synced, artists }
  useStore.setState({ artists, artistInfo })
}

/** Loads the next page of artists (GET /api/library/artists/page), if there is one and it isn't loading already. */
export const loadMoreArtists = async (): Promise<void> => {
  const { next, loading: busy } = useArtistPages.getState()
  if (!next || busy) return
  useArtistPages.setState({ loading: true })
  try {
    const res = await fetch(`/api/library/artists/page?after=${encodeURIComponent(next)}`)
    if (!res.ok) throw new Error(String(res.status))
    const page = await res.json() as ArtistPage
    mergeArtists(page)
    useArtistPages.setState({ next: page.next, loading: false })
  } catch {
    // Tried again the next time the catalog asks.
    useArtistPages.setState({ loading: false })
  }
}

/** Lookups already made in this session (by query), so each is asked once. */
const asked = new Map<string, Promise<void>>()

/**
 * Looks artists up in the database (GET /api/library/artists/find) and adds any not here yet to the store: by Spotify
 * id, by exact name, or whose name contains `q`. Each lookup is made once per session; a failed one is tried again.
 */
export const findArtists = ({ vendorIds = [], names = [], q }: ArtistQuery): Promise<void> => {
  if (useArtistPages.getState().next === null) return Promise.resolve() // every artist is here already
  const params = new URLSearchParams()
  for (const id of [...new Set(vendorIds)].sort().slice(0, 50)) params.append('vendor', id)
  for (const n of [...new Set(names.map(n => n.trim()).filter(n => n && n.length <= 200))].sort().slice(0, 50)) params.append('name', n)
  if (q?.trim()) params.set('q', q.trim())
  const key = params.toString()
  if (!key) return Promise.resolve()
  const known = asked.get(key)
  if (known) return known
  const find = fetch(`/api/library/artists/find?${key}`)
    .then(async res => {
      if (!res.ok) throw new Error(String(res.status))
      mergeArtists(await res.json() as Omit<ArtistPage, 'next'>)
    })
    .catch(() => { asked.delete(key) })
  asked.set(key, find)
  return find
}

/**
 * loadArtists for the artists these catalogue references match (store.matchArtist). Any not here yet are looked up
 * in the database first (findArtists), so an artist on a page not loaded yet is found, not added again.
 */
export const loadArtistsFor = async (refs: Pick<ArtistRef, 'name' | 'vendor'>[]): Promise<void> => {
  const missing = refs.filter(r => !matchArtist(useStore.getState().artists, r))
  if (missing.length) {
    await findArtists({
      vendorIds: missing.flatMap(r => r.vendor?.name === 'spotify' ? [r.vendor.id] : []),
      names: missing.map(r => r.name),
    })
  }
  const artists = useStore.getState().artists
  return loadArtists(refs.map(r => matchArtist(artists, r)?.id).filter((id): id is string => !!id))
}
