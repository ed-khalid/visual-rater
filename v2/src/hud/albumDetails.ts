import { create } from 'zustand'
import type { AlbumDetails } from '../shared/suggestions'
import { useView } from '../scene/view'
import { loadArtistsFor } from '../state/remote'
import { useStore } from '../state/store'
import { enterAlbumView } from './Catalog'

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

/** Whether this album's tracklist still has to be fetched from the catalogue. */
export const needsTracklist = (albumId: string) => {
  const album = useStore.getState().albums[albumId]
  return !!album && album.vendor?.name === 'spotify' && !album.tracklistLoaded
}

/**
 * Fetches an album's details (artist, year, tracklist) from the API and stores them (see store.setAlbumDetails).
 * Safe to call repeatedly: does nothing if the tracklist is already there or a load is under way.
 */
export const loadAlbumDetails = (itemId: string): Promise<void> => {
  const vendor = useStore.getState().albums[itemId]?.vendor
  if (!needsTracklist(itemId) || !vendor) return Promise.resolve()
  const existing = inFlight.get(itemId)
  if (existing) return existing

  setStatus(itemId, 'loading')
  const load = fetch(`/api/music/albums/${encodeURIComponent(vendor.id)}`)
    .then(async res => {
      if (!res.ok) throw new Error(String(res.status))
      const album = await res.json() as AlbumDetails
      // An album with no artist yet gets the catalogue's: if that's an artist here, their albums load first.
      if (!useStore.getState().albums[itemId]?.artistId && album.artist) {
        await loadArtistsFor([{ name: album.artist, ...(album.artistId ? { vendor: { name: 'spotify' as const, id: album.artistId } } : {}) }])
      }
      // Only fills in what's still missing: the user may have edited the album (or deleted it) while this loaded.
      useStore.getState().setAlbumDetails(itemId, album)
      setStatus(itemId, null)
    })
    .catch(() => setStatus(itemId, 'error'))
    .finally(() => inFlight.delete(itemId))
  inFlight.set(itemId, load)
  return load
}

/**
 * Puts a staged album's tracks on the tree (loading its tracklist first if it isn't there yet) and opens album view
 * on it, which is where its songs get rated. Used by a staged album's box in the catalog (hud/Catalog).
 * Resolves false if the tracklist couldn't be loaded.
 */
export const addStagedAlbum = async (albumId: string): Promise<boolean> => {
  if (needsTracklist(albumId)) {
    await loadAlbumDetails(albumId)
    if (needsTracklist(albumId)) return false
  }
  const v = useView.getState()
  if (v.hoveredId === albumId) v.setHovered(null)
  useStore.getState().addAlbumTracks(albumId)
  // Its new tracks are rated in album view: everything else on the tree draws back into the trunk.
  enterAlbumView(albumId)
  return true
}

/** "4:11" */
export const formatDuration = (ms: number) => {
  const total = Math.round(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
