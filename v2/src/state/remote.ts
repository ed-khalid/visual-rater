import { create } from 'zustand'
import type { Persisted } from '../shared/model'
import { type Changes, diffState, everything, isEmpty, mergeChanges } from '../shared/sync'
import { LEGACY_STORAGE_KEY, LEGACY_STORAGE_VERSION, migrateState, type State, useStore } from './store'

/**
 * Keeps the store and the database in step. On startup, loads everything from the API (importing data that only
 * exists in this browser's localStorage the first time, if the database is empty). After that, every change to the
 * store is turned into a batch of upserts/deletes (shared/sync.ts) and sent to POST /api/sync, debounced, one
 * request at a time; failed saves are kept, merged with newer ones, and retried with backoff.
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

/** UI-only state kept in the browser, not the database: which board was open. */
const UI_KEY = 'visual-rater-v2.ui'
/** Where the imported localStorage data is kept afterwards, as a backup. */
const IMPORTED_KEY = 'visual-rater-v2.imported-backup'

const DEBOUNCE_MS = 250
const MAX_RETRY_MS = 30_000

const persistedOf = (s: Persisted): Persisted =>
  ({ types: s.types, items: s.items, boards: s.boards, placements: s.placements, staged: s.staged, added: s.added })

const sameRefs = (a: Persisted, b: Persisted) =>
  a.types === b.types && a.items === b.items && a.boards === b.boards && a.placements === b.placements && a.staged === b.staged && a.added === b.added

const hasData = (s: Persisted) => Object.keys(s.boards).length > 0 || Object.keys(s.items).length > 0

/**
 * What this browser saved in localStorage before v2 had a database, upgraded to the current shape, plus which board
 * was open (so the first visit after upgrading looks exactly as before).
 */
export const readLegacy = (storage: Storage = localStorage): { data: Persisted, activeBoardId: string | null } | null => {
  const raw = storage.getItem(LEGACY_STORAGE_KEY)
  if (!raw) return null
  try {
    const { state, version } = JSON.parse(raw) as { state: unknown, version: number }
    const s = version === LEGACY_STORAGE_VERSION ? state as State : migrateState(state, version)
    return { data: persistedOf(s), activeBoardId: s.activeBoardId ?? null }
  } catch {
    return null
  }
}

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
  if (state.activeBoardId !== prev.activeBoardId) {
    try { localStorage.setItem(UI_KEY, JSON.stringify({ activeBoardId: state.activeBoardId })) } catch { /* private mode */ }
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

  // First run against an empty database: bring over what this browser had saved before.
  const legacy = readLegacy()
  let legacyBoard: string | null = null
  if (!hasData(remote) && legacy && hasData(legacy.data)) {
    const imported: Persisted = { ...legacy.data, types: { ...remote.types, ...legacy.data.types } }
    legacyBoard = legacy.activeBoardId
    try {
      await post(everything(imported))
      localStorage.setItem(IMPORTED_KEY, localStorage.getItem(LEGACY_STORAGE_KEY)!)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      remote = imported
    } catch {
      useSync.setState({ status: 'offline' })
      return
    }
  }

  let activeBoardId: string | null = legacyBoard
  try { activeBoardId = (JSON.parse(localStorage.getItem(UI_KEY) ?? '{}') as { activeBoardId?: string }).activeBoardId ?? activeBoardId } catch { /* ignore */ }
  useStore.setState({ ...remote, activeBoardId: activeBoardId && remote.boards[activeBoardId] ? activeBoardId : null })
  synced = persistedOf(useStore.getState())
  unsubscribe?.()
  unsubscribe = useStore.subscribe(onChange)
  window.removeEventListener('pagehide', onPageHide)
  window.addEventListener('pagehide', onPageHide)
  useSync.setState({ status: 'ready' })
}
