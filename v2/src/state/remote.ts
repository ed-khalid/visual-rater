import { create } from 'zustand'
import { COLLECTIONS, type Persisted, TYPES, type TypeId } from '../shared/model'
import { type Changes, diffState, isEmpty, mergeChanges } from '../shared/sync'
import { type State, useStore } from './store'

/**
 * Keeps the store and the database in step. On startup, loads everything from GET /api/state. After that, every
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
  let remote: Persisted
  try {
    const res = await fetch('/api/state')
    if (!res.ok) throw new Error(String(res.status))
    remote = await res.json() as Persisted
  } catch {
    useSync.setState({ status: 'offline' })
    return
  }

  let activeType: TypeId | null = null
  try {
    const saved = (JSON.parse(localStorage.getItem(UI_KEY) ?? '{}') as { activeType?: string }).activeType
    if (TYPES.some(t => t.id === saved)) activeType = saved as TypeId
  } catch { /* ignore */ }
  useStore.setState({ ...remote, activeType })
  synced = persistedOf(useStore.getState())
  unsubscribe?.()
  unsubscribe = useStore.subscribe(onChange)
  window.removeEventListener('pagehide', onPageHide)
  window.addEventListener('pagehide', onPageHide)
  useSync.setState({ status: 'ready' })
}
