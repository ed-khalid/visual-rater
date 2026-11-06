import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { Album, Artist, Branch, Persisted, Simple, Track, TypeId, VendorRef } from '../shared/model'
import { emptyPersisted } from '../shared/model'
import type { AlbumDetails, Track as CatalogueTrack } from '../shared/suggestions'
import { find, positionOf, tracksOf, treeNodes } from './board'
import { autoAlign, chooseBranch, groupPlanes, clashes, directionNear, MAX_BRANCH_LENGTH, MIN_BRANCH_LENGTH, NEAR_POSITION, preferredDirection, ringLength } from './layout'

export type { Album, Artist, Persisted, Simple, Track, TypeId, VendorRef } from '../shared/model'

/** An album's artist as the catalogue gives it: matched to an artist by catalogue id, or by name without one. */
export type ArtistRef = { name: string, vendor?: VendorRef }

/** A catalogue album being added (from an ADD suggestion). */
export type NewAlbum = { name: string, image?: string, vendor?: VendorRef, year?: number, artist?: ArtistRef }

/** The scoring scale: 0 at the bottom of the trunk, 100 at the top. */
export const SCORE_MIN = 0
export const SCORE_MAX = 100
export const positionToScore = (position: number) => SCORE_MIN + Math.min(1, Math.max(0, position)) * (SCORE_MAX - SCORE_MIN)
export const scoreToPosition = (score: number) => Math.min(1, Math.max(0, (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)))

export type State = Persisted & {
  /** The type whose tree is open; null: the type picker is showing. */
  activeType: TypeId | null
}

type Actions = {
  openType: (type: TypeId) => void
  /** Back to the type picker. */
  closeBoard: () => void
  /**
   * Adds something typed on the open tree: on MUSIC a track (with no album or artist), on MOVIES a movie, on BOOKS a
   * book. It goes on the tree unrated. Returns its id, or null for a blank name or a name that's already there.
   */
  addTyped: (name: string) => string | null
  /** Adds a catalogue album to the staging tray (with its artist). Null if that album is already here. */
  addAlbum: (album: NewAlbum) => string | null
  /**
   * Fills in an album from the catalogue: artist, year and cover where they're still missing, and, the first time,
   * its tracklist (each track its own record, not on the tree until the album is added).
   */
  setAlbumDetails: (albumId: string, details: AlbumDetails) => void
  /** Saves an image's colours (colors[0]: raw dominant colour) on whatever has that id. */
  setColors: (id: string, colors: string[]) => void
  /**
   * User edits to an album: title, year (null clears it) and tracklist (its tracks, in order, with their names).
   * Text is trimmed; blank titles or track names are rejected (returns false, nothing changes). Tracks are renumbered
   * 1, 2, 3… within each disc, and tracks left out are deleted.
   */
  editAlbum: (albumId: string, edit: { name?: string, year?: number | null, tracks?: { id: string, name: string }[] }) => boolean
  /**
   * Puts a staged album's tracks on the tree (each gets a branch, unrated until dragged) and moves the album to the
   * added column. Returns how many tracks went on, or null if the album isn't staged.
   */
  addAlbumTracks: (albumId: string) => number | null
  /**
   * Moves fruit: `position` up or down the trunk (0–1) sets its score; `length` sets its branch length. Both are
   * clamped. If the new height puts its branch too close to another, only this branch turns to the nearest free
   * direction.
   */
  move: (id: string, move: { position?: number, length?: number }) => void
  /** Re-lays out the open tree's fruit (see layout.autoAlign). Heights never change. */
  autoAlignBoard: () => void
  /**
   * The trash icon. A track is hidden (off the tree, score kept); a movie or book is deleted; an album is deleted
   * with its tracks, and its artist if nothing else of theirs is left. Artists can't be removed directly.
   */
  remove: (id: string) => void
}

const normalise = (name: string) => name.trim().replace(/\s+/g, ' ')
const sameVendor = (a: VendorRef | undefined, b: VendorRef | undefined) => !!a && !!b && a.name === b.name && a.id === b.id

export const initialState = (): State => ({ ...emptyPersisted(), activeType: null })

/** A branch for something going on a type's tree at `position`, clear of the branches already there. */
const newBranch = (s: Persisted, type: TypeId, position: number, extra: { position: number, branch: Branch }[] = []): Branch => {
  const existing = [
    ...treeNodes(s, type).map(n => ({ y: positionOf(n.entity), angle: n.entity.branch!.angle, ring: n.entity.branch!.ring })),
    ...extra.map(e => ({ y: e.position, angle: e.branch.angle, ring: e.branch.ring })),
  ]
  return chooseBranch(position, existing, NEAR_POSITION, preferredDirection(existing.length))
}

/**
 * A type's tree, re-laid out (layout.autoAlign); heights never change. On MUSIC each album's tracks share a plane of
 * their own (tracks with no album share one too), in the order the albums went on the tree, so orbiting shows one
 * album at a time face-on. Elsewhere, as many as fit on the main plane.
 */
const aligned = (s: Persisted, type: TypeId): Partial<Persisted> => {
  const nodes = treeNodes(s, type)
  let planes: number[] | undefined
  if (type === 'music') {
    const groupOf = (n: (typeof nodes)[number]) => (n.entity as Track).albumId ?? ''
    const order = [...new Set(nodes.map(groupOf))]
      .sort((a, b) => (a ? s.albums[a]?.addedAt ?? 0 : Infinity) - (b ? s.albums[b]?.addedAt ?? 0 : Infinity))
    const turns = groupPlanes(order.length)
    planes = nodes.map(n => turns[order.indexOf(groupOf(n))])
  }
  const branches = autoAlign(nodes.map(n => positionOf(n.entity)), planes)
  const updates: Record<string, Record<string, Track | Simple>> = {}
  nodes.forEach((n, i) => {
    const table = updates[n.collection] ?? { ...s[n.collection] }
    table[n.id] = { ...n.entity, branch: branches[i] }
    updates[n.collection] = table
  })
  return updates as Partial<Persisted>
}

/** The artist for an album, found or made in `artists` (which it may change). */
const ensureArtist = (artists: Record<string, Artist>, ref: ArtistRef): string | undefined => {
  const name = normalise(ref.name)
  if (!name) return undefined
  const all = Object.values(artists)
  const sameName = (a: Artist) => a.name.toLowerCase() === name.toLowerCase()
  if (ref.vendor) {
    const byVendor = all.find(a => sameVendor(a.vendor, ref.vendor))
    if (byVendor) return byVendor.id
    const byName = all.find(a => !a.vendor && sameName(a))
    if (byName) { artists[byName.id] = { ...byName, vendor: ref.vendor }; return byName.id }
  } else {
    const byName = all.find(sameName)
    if (byName) return byName.id
  }
  const artist: Artist = { id: crypto.randomUUID(), name, ...(ref.vendor ? { vendor: ref.vendor } : {}) }
  artists[artist.id] = artist
  return artist.id
}

const trackFrom = (album: Album, t: CatalogueTrack): Track => ({
  id: crypto.randomUUID(),
  name: normalise(t.name) || 'Untitled',
  ...(album.image ? { image: album.image } : {}),
  ...(album.colors ? { colors: album.colors } : {}),
  ...(album.vendor ? { vendor: { name: album.vendor.name, id: t.id } } : {}),
  albumId: album.id,
  ...(album.artistId ? { artistId: album.artistId } : {}),
  disc: t.disc, number: t.number, durationMs: t.durationMs,
})

/** Whether a typed name is already on a type's tree (ignoring case). */
export const nameTaken = (s: Persisted, type: TypeId, name: string) => {
  const wanted = normalise(name).toLowerCase()
  return treeNodes(s, type).some(n => n.entity.name.toLowerCase() === wanted)
}

/** Whether a catalogue album is here: 'staged' (in the tray), 'added' (tracks on the tree), or false. */
export const albumStatus = (s: Persisted, vendor: VendorRef): 'staged' | 'added' | false => {
  const album = Object.values(s.albums).find(a => sameVendor(a.vendor, vendor))
  return !album ? false : album.addedAt === undefined ? 'staged' : 'added'
}

/**
 * The app's state. Saved to the database by state/remote.ts, which loads it on startup and sends every change to
 * the API server; this store itself only holds it in memory.
 */
export const useStore = create<State & Actions>()((set, get) => ({
  ...initialState(),

  openType: (type) => set({ activeType: type }),
  closeBoard: () => set({ activeType: null }),

  addTyped: (rawName) => {
    const s = get()
    const name = normalise(rawName)
    const type = s.activeType
    if (!type || !name || nameTaken(s, type, name)) return null
    const entity: Simple = { id: crypto.randomUUID(), name, branch: newBranch(s, type, positionOf({})), since: Date.now() }
    const collection = type === 'music' ? 'tracks' : type
    set({ [collection]: { ...s[collection], [entity.id]: entity } } as Partial<State>)
    return entity.id
  },

  addAlbum: (a) => {
    const s = get()
    const name = normalise(a.name)
    if (!name || (a.vendor && albumStatus(s, a.vendor))) return null
    const artists = { ...s.artists }
    const artistId = a.artist ? ensureArtist(artists, a.artist) : undefined
    const album: Album = {
      id: crypto.randomUUID(), name, tracklistLoaded: false, stagedAt: Date.now(),
      ...(a.image ? { image: a.image } : {}), ...(a.vendor ? { vendor: a.vendor } : {}),
      ...(a.year !== undefined ? { year: a.year } : {}), ...(artistId ? { artistId } : {}),
    }
    set({ artists, albums: { ...s.albums, [album.id]: album } })
    return album.id
  },

  setAlbumDetails: (albumId, details) => {
    const s = get()
    const current = s.albums[albumId]
    if (!current) return
    const artists = { ...s.artists }
    const album: Album = { ...current }
    if (!album.artistId && details.artist) {
      const artistId = ensureArtist(artists, { name: details.artist, ...(details.artistId ? { vendor: { name: 'spotify', id: details.artistId } } : {}) })
      if (artistId) album.artistId = artistId
    }
    if (album.year === undefined && details.year !== undefined) album.year = details.year
    if (!album.image && details.image) album.image = details.image
    const tracks = { ...s.tracks }
    if (!album.tracklistLoaded) {
      album.tracklistLoaded = true
      for (const t of details.tracks) {
        const vendor = album.vendor ? { name: album.vendor.name, id: t.id } : undefined
        const existing = vendor ? Object.values(tracks).find(x => sameVendor(x.vendor, vendor)) : undefined
        if (!existing) { const track = trackFrom(album, t); tracks[track.id] = track }
        else if (!existing.albumId) tracks[existing.id] = { ...existing, albumId } // a track that outlived an earlier copy of this album
      }
    }
    set({ artists, albums: { ...s.albums, [albumId]: album }, tracks })
  },

  setColors: (id, colors) => {
    const s = get()
    const f = find(s, id)
    if (!f) return
    set({ [f.collection]: { ...s[f.collection], [id]: { ...f.entity, colors } } } as Partial<State>)
  },

  editAlbum: (albumId, edit) => {
    const s = get()
    const current = s.albums[albumId]
    if (!current) return false
    const album: Album = { ...current }
    if (edit.name !== undefined) {
      const name = normalise(edit.name)
      if (!name) return false
      album.name = name
    }
    if (edit.year !== undefined) {
      if (edit.year === null) delete album.year
      else if (!Number.isInteger(edit.year)) return false
      else album.year = edit.year
    }
    const tracks = { ...s.tracks }
    if (edit.tracks !== undefined) {
      const names = edit.tracks.map(t => normalise(t.name))
      if (names.some(n => !n)) return false
      const kept = new Set(edit.tracks.map(t => t.id))
      for (const t of tracksOf(s, albumId)) if (!kept.has(t.id)) delete tracks[t.id]
      const perDisc = new Map<number, number>()
      edit.tracks.forEach((t, i) => {
        const track = s.tracks[t.id]
        if (!track || track.albumId !== albumId) return
        const disc = track.disc ?? 0
        const number = (perDisc.get(disc) ?? 0) + 1
        perDisc.set(disc, number)
        if (track.name !== names[i] || track.number !== number) tracks[t.id] = { ...track, name: names[i], number }
      })
    }
    set({ albums: { ...s.albums, [albumId]: album }, tracks })
    return true
  },

  addAlbumTracks: (albumId) => {
    const s = get()
    const album = s.albums[albumId]
    if (!album || album.addedAt !== undefined) return null
    const now = Date.now()
    const tracks = { ...s.tracks }
    const placed: { position: number, branch: Branch }[] = []
    let count = 0
    for (const t of tracksOf(s, albumId)) {
      if (t.branch || t.hidden) continue
      const branch = newBranch(s, 'music', positionOf(t), placed)
      placed.push({ position: positionOf(t), branch })
      // `since` increases by track, so the tree lays them out in tracklist order
      tracks[t.id] = { ...t, branch, since: now + count }
      count++
    }
    const next = { ...s, tracks, albums: { ...s.albums, [albumId]: { ...album, addedAt: now } } }
    // The album gets a plane of its own, so every album's plane turns to make room.
    set({ albums: next.albums, ...aligned(next, 'music') })
    return count
  },

  move: (id, m) => {
    const s = get()
    const f = find(s, id)
    if (!f || (f.collection !== 'tracks' && f.collection !== 'movies' && f.collection !== 'books') || !f.entity.branch || !s.activeType) return
    const current = f.entity
    let next = { ...current, branch: { ...current.branch! } }
    if (m.position !== undefined) {
      next.score = positionToScore(m.position)
      const others = treeNodes(s, s.activeType).filter(n => n.id !== id)
        .map(n => ({ y: positionOf(n.entity), angle: n.entity.branch!.angle, ring: n.entity.branch!.ring }))
      if (clashes(positionOf(next), next.branch, others, NEAR_POSITION)) {
        const branch = chooseBranch(positionOf(next), others, NEAR_POSITION, directionNear(current.branch!.angle, current.branch!.ring))
        const custom = current.branch!.length !== ringLength(current.branch!.ring)
        next = { ...next, branch: { ...branch, length: custom ? current.branch!.length : branch.length } }
      }
    }
    if (m.length !== undefined) next.branch.length = Math.min(MAX_BRANCH_LENGTH, Math.max(MIN_BRANCH_LENGTH, m.length))
    set({ [f.collection]: { ...s[f.collection], [id]: next } } as Partial<State>)
  },

  autoAlignBoard: () => {
    const s = get()
    if (s.activeType) set(aligned(s, s.activeType))
  },

  remove: (id) => {
    const s = get()
    const f = find(s, id)
    if (!f) return
    if (f.collection === 'tracks') return set({ tracks: { ...s.tracks, [id]: { ...f.entity, hidden: true } } })
    if (f.collection === 'movies' || f.collection === 'books') {
      const table = { ...s[f.collection] }
      delete table[id]
      return set({ [f.collection]: table } as Partial<State>)
    }
    if (f.collection === 'albums') {
      const albums = { ...s.albums }, tracks = { ...s.tracks }, artists = { ...s.artists }
      delete albums[id]
      for (const t of tracksOf(s, id)) delete tracks[t.id]
      const artistId = f.entity.artistId
      const stillUsed = artistId && (Object.values(albums).some(a => a.artistId === artistId) || Object.values(tracks).some(t => t.artistId === artistId))
      if (artistId && !stillUsed) delete artists[artistId]
      // An album that was on the tree leaves its plane empty: close the gap.
      const onTree = f.entity.addedAt !== undefined
      set({ albums, tracks, artists, ...(onTree ? aligned({ ...s, albums, tracks, artists }, 'music') : {}) })
    }
  },
}))

/** The saved collections, re-rendering only when one of them changes (lookups like `find` then work on this). */
export const usePersisted = (): Persisted =>
  useStore(useShallow(s => ({ artists: s.artists, albums: s.albums, tracks: s.tracks, movies: s.movies, books: s.books })))
