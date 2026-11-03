import { create } from 'zustand'
import type { AlbumDetails } from '../shared/suggestions'
import { useStore } from '../state/store'

type LoadStatus = 'loading' | 'error'

/** Load status of album tracklists, by item id. Not persisted: a failed load is retried next time it's needed. */
export const useAlbumLoads = create<{ status: Record<string, LoadStatus> }>()(() => ({ status: {} }))

const inFlight = new Map<string, Promise<void>>()

const setStatus = (itemId: string, status: LoadStatus | null) =>
  useAlbumLoads.setState(s => {
    const next = { ...s.status }
    if (status) next[itemId] = status; else delete next[itemId]
    return { status: next }
  })

/**
 * Fetches an album's details (artist, year, tracklist) from the API and stores them on the item.
 * Safe to call repeatedly: does nothing if the tracks are already there or a load is under way.
 */
export const loadAlbumDetails = (itemId: string): Promise<void> => {
  const item = useStore.getState().items[itemId]
  if (!item || item.tracks || item.source?.provider !== 'spotify' || item.source.kind !== 'album') return Promise.resolve()
  const existing = inFlight.get(itemId)
  if (existing) return existing

  setStatus(itemId, 'loading')
  const load = fetch(`/api/music/albums/${encodeURIComponent(item.source.id)}`)
    .then(async res => {
      if (!res.ok) throw new Error(String(res.status))
      const album = await res.json() as AlbumDetails
      // Only fill in what's still missing: the user may have edited the album (or deleted it) while this loaded.
      const now = useStore.getState().items[itemId]
      if (!now) return setStatus(itemId, null)
      useStore.getState().setItemDetails(itemId, {
        artist: now.artist ?? (album.artist || undefined),
        year: now.year ?? album.year,
        tracks: now.tracks ?? album.tracks,
        image: now.image ?? album.image,
      })
      setStatus(itemId, null)
    })
    .catch(() => setStatus(itemId, 'error'))
    .finally(() => inFlight.delete(itemId))
  inFlight.set(itemId, load)
  return load
}

/** "4:11" */
export const formatDuration = (ms: number) => {
  const total = Math.round(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
