/**
 * What travels between the app and the API server when saving: per collection (artists, albums, tracks, movies,
 * books), records to create-or-update and ids to delete, applied in one transaction.
 */
import { type Collection, COLLECTIONS, emptyPersisted, type Persisted } from './model'

export type Changes = {
  upsert: { [C in Collection]: Persisted[C][string][] }
  remove: { [C in Collection]: string[] }
}

export const emptyChanges = (): Changes => ({
  upsert: { artists: [], albums: [], tracks: [], movies: [], books: [] },
  remove: { artists: [], albums: [], tracks: [], movies: [], books: [] },
})

export const isEmpty = (c: Changes) => COLLECTIONS.every(k => c.upsert[k].length === 0 && c.remove[k].length === 0)

/**
 * What changed between two saved states. The store only ever replaces records it changes, so a different object
 * means "changed" and a missing id means "deleted".
 */
export const diffState = (prev: Persisted, next: Persisted): Changes => {
  const c = emptyChanges()
  for (const k of COLLECTIONS) {
    if (prev[k] === next[k]) continue
    const a = prev[k] as Record<string, unknown>, b = next[k] as Record<string, unknown>
    for (const [id, v] of Object.entries(b)) if (a[id] !== v) (c.upsert[k] as unknown[]).push(v)
    for (const id of Object.keys(a)) if (!(id in b)) c.remove[k].push(id)
  }
  return c
}

/**
 * Folds a newer batch into an older unsent one, so a retry sends the latest version of everything once:
 * a later upsert replaces an earlier one or cancels an earlier delete, and a later delete cancels an earlier upsert.
 */
export const mergeChanges = (older: Changes, newer: Changes): Changes => {
  const out = emptyChanges()
  for (const k of COLLECTIONS) {
    const ups = new Map((older.upsert[k] as { id: string }[]).map(x => [x.id, x])), rms = new Set(older.remove[k])
    for (const x of newer.upsert[k] as { id: string }[]) { ups.set(x.id, x); rms.delete(x.id) }
    for (const id of newer.remove[k]) { ups.delete(id); rms.add(id) }
    ;(out.upsert[k] as unknown[]).push(...ups.values())
    out.remove[k].push(...rms)
  }
  return out
}

/** Everything in a state, as one batch of upserts. */
export const everything = (s: Persisted): Changes => diffState(emptyPersisted(), s)
