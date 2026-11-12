import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { Album, Artist, ArtistInfo, Branch, Persisted, Simple, Track, TypeId, VendorRef } from '../shared/model'
import { emptyPersisted, MISC_NAME } from '../shared/model'
import { isSkit, SHORT_TITLE_MAX, shortTitle } from '../shared/names'
import { snapScore } from '../shared/scale'
import { markLive } from './live'
import type { AlbumDetails, Track as CatalogueTrack } from '../shared/suggestions'
import { find, positionOf, tracksOf, treeNodes } from './board'
import { autoAlign, chooseBranch, groupDirections, clashes, directionNear, MAX_BRANCH_LENGTH, MIN_BRANCH_LENGTH, NEAR_POSITION, preferredDirection, ringLength } from './layout'

export type { Album, Artist, Persisted, Simple, Track, TypeId, VendorRef } from '../shared/model'

/** An album's artist as the catalogue gives it: matched to an artist by catalogue id, or by name without one. */
export type ArtistRef = { name: string, vendor?: VendorRef, /** their picture, if the catalogue has one; fills in a missing one */ image?: string }

/** A catalogue song being added on its own (from an ADD suggestion). */
export type NewSong = {
  name: string, vendor: VendorRef, image?: string, durationMs?: number
  /** The catalogue album it's on: if that's in the catalog, the song goes there. */
  album?: VendorRef
  artist: ArtistRef
}

/**
 * Where an added song ended up: on its own album (`staged`: that album is still staged, so its tracks have to be put
 * on the tree first; hud/albumDetails addStagedAlbum), or on the artist's Misc album. Either way, album view opens on it.
 */
export type SongPlace = { albumId: string, staged?: boolean }

/**
 * A song typed into the ADD palette's form (hud/TypedSong), by an artist: one already here (`id`, picked from the
 * form's options) or a new one (`name`); on one of their albums (`id`, already on the tree), a new album (`name`),
 * or, with none, their Misc album. `image` is its cover (a link, or an uploaded picture as a data: URL).
 */
export type TypedSong = {
  name: string
  artist: { id: string } | { name: string }
  album?: { id: string } | { name: string }
  image?: string
}

/** A catalogue album being added (from an ADD suggestion). */
export type NewAlbum = { name: string, image?: string, vendor?: VendorRef, year?: number, artist?: ArtistRef }

/** Stored scores: 0 at the bottom of the trunk, 100 at the top (shown on the scale in use: shared/scale.ts). */
export const SCORE_MIN = 0
export const SCORE_MAX = 100
/** A height on the trunk as a stored score, snapped to the scale's steps (unless it's continuous). */
export const positionToScore = (position: number) => snapScore(SCORE_MIN + Math.min(1, Math.max(0, position)) * (SCORE_MAX - SCORE_MIN))
export const scoreToPosition = (score: number) => Math.min(1, Math.max(0, (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)))

export type State = Persisted & {
  /** The type whose tree is open; null: the type picker is showing. */
  activeType: TypeId | null
  /**
   * A summary of each artist whose albums and tracks aren't loaded yet (they load when needed: state/remote.ts
   * loadArtists, which drops the artist from here). Never saved. Artists added in this session are never in it.
   */
  artistInfo: Record<string, ArtistInfo>
}

type Actions = {
  openType: (type: TypeId) => void
  /** Back to the type picker. */
  closeBoard: () => void
  /**
   * Adds something typed on the open tree: on MUSIC a track (with no album or artist), on MOVIES a movie, on BOOKS a
   * book. It goes on the tree unrated. Returns its id, or null for a blank name or a name that's already there.
   */
  addTyped: (name: string, image?: string) => string | null
  /**
   * Adds a typed song by an artist (see TypedSong), on the tree, unrated, after the album's songs; an artist or album
   * typed by a name already here is that one. Returns where it went, or null: a blank name, an unknown or staged album
   * (put a staged one on the tree first), or a song by that name already on the album.
   */
  addTypedSong: (song: TypedSong) => { albumId: string, trackId: string } | null
  /**
   * Moves an album, and its songs, to another artist (picked, or a new one by that name; one here by that name is
   * used). Their albums must be loaded. A Misc album moved to an artist who has one already goes into theirs, its
   * songs after theirs. The artist it leaves goes if nothing else of theirs is left. Returns the album the songs are
   * on now (Misc: possibly the other's), or null if nothing could be moved.
   */
  moveAlbum: (albumId: string, artist: { id: string } | { name: string }) => string | null
  /** An artist typed in (the ADD palette): the one here by that name, or a new one. Their id; null for a blank name. */
  addArtist: (name: string) => string | null
  /**
   * An album made by hand on an artist's overview: on the tree at once, its songs (in the order given, blank lines
   * left out) unrated. Null if the title is blank, the artist isn't here, or they already have an album by that name.
   */
  createAlbum: (artistId: string, album: { name: string, year?: number, image?: string, tracks: string[] }) => string | null
  /** Adds a catalogue album to the staging tray (with its artist). Null if that album is already here. */
  addAlbum: (album: NewAlbum) => string | null
  /**
   * Adds a catalogue song on its own. Already here: back on the tree if it was hidden. On an album in the catalog:
   * that album (a staged one is left for the caller to put on the tree). Otherwise: the artist's Misc album (made the
   * first time), on the tree, unrated, after the songs already there. Null for a blank name.
   */
  addSong: (song: NewSong) => SongPlace | null
  /**
   * Fills in an album from the catalogue: artist, year and cover where they're still missing, and, the first time,
   * its tracklist (each track its own record, not on the tree until the album is added).
   */
  setAlbumDetails: (albumId: string, details: AlbumDetails) => void
  /** Saves an image's colours (colors[0]: raw dominant colour) on whatever has that id. */
  setColors: (id: string, colors: string[]) => void
  /**
   * A new picture (a link or an uploaded data: URL) on whatever has that id, and on an album's songs too; their
   * stored colours go, to be worked out from it again.
   */
  setImage: (id: string, image: string) => void
  /**
   * User edits to an album: title, year (null clears it) and tracklist (its tracks, in order, with their names).
   * Text is trimmed; blank titles or track names are rejected (returns false, nothing changes). Tracks are renumbered
   * 1, 2, 3… within each disc, and tracks left out are deleted.
   */
  editAlbum: (albumId: string, edit: { name?: string, year?: number | null, tracks?: { id: string, name: string, /** blank: none */ shortTitle?: string, /** Track.notASong; not given: as it was */ notASong?: boolean, /** Track.live; not given: as it was */ live?: boolean }[] }) => boolean
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
  /** Takes a song's, movie's or book's score away: it's unrated again, still on the tree. */
  unrate: (id: string) => void
  /** Re-lays out the open tree's fruit (see layout.autoAlign). Heights never change. */
  autoAlignBoard: () => void
  /**
   * The reset button: re-lays out the open tree with every branch on the main plane, heading straight left or right
   * of the trunk from the starting view (album planes included), stems out as far as it takes. Heights never change.
   */
  flattenBoard: () => void
  /**
   * The trash icon. A track is hidden (off the tree, score kept); a movie or book is deleted; an album is deleted
   * with its tracks, and its artist if nothing else of theirs is left. Artists can't be removed directly.
   */
  remove: (id: string) => void
}

const normalise = (name: string) => name.trim().replace(/\s+/g, ' ')
const sameVendor = (a: VendorRef | undefined, b: VendorRef | undefined) => !!a && !!b && a.name === b.name && a.id === b.id

export const initialState = (): State => ({ ...emptyPersisted(), activeType: null, artistInfo: {} })

/** A branch for something going on a type's tree at `position`, clear of the branches already there. */
const newBranch = (s: Persisted, type: TypeId, position: number, extra: { position: number, branch: Branch }[] = []): Branch => {
  const existing = [
    ...treeNodes(s, type).map(n => ({ y: positionOf(n.entity), angle: n.entity.branch!.angle, ring: n.entity.branch!.ring })),
    ...extra.map(e => ({ y: e.position, angle: e.branch.angle, ring: e.branch.ring })),
  ]
  return chooseBranch(position, existing, NEAR_POSITION, preferredDirection(existing.length))
}

/**
 * A type's tree, re-laid out (layout.autoAlign); heights never change. On MUSIC each album's tracks (and the tracks
 * with no album, as a group of their own) go in the order the albums went on the tree, and with more than one group,
 * every track in a group points the same way: round the whole turn (two groups straight left and right, three 120°
 * apart…), or with `flat` (the reset button), all left or all right of the trunk on the main plane, each group on
 * the side with fewer tracks so far. Elsewhere, as many as fit on the main plane, or with `flat`, all of them.
 */
const aligned = (s: Persisted, type: TypeId, flat = false): Partial<Persisted> => {
  const nodes = treeNodes(s, type)
  let planes: number[] | undefined = flat ? nodes.map(() => 0) : undefined
  let sides: (1 | -1)[] | undefined
  if (type === 'music') {
    const groupOf = (n: (typeof nodes)[number]) => (n.entity as Track).albumId ?? ''
    const order = [...new Set(nodes.map(groupOf))]
      .sort((a, b) => (a ? s.albums[a]?.addedAt ?? 0 : Infinity) - (b ? s.albums[b]?.addedAt ?? 0 : Infinity))
    const group = nodes.map(n => order.indexOf(groupOf(n)))
    if (order.length === 1) planes ??= nodes.map(() => 0)
    else if (flat) {
      const sizes = order.map((_, g) => group.filter(x => x === g).length)
      const used = { 1: 0, [-1]: 0 } as Record<1 | -1, number>
      const sideOf = sizes.map(size => { const side: 1 | -1 = used[1] <= used[-1] ? 1 : -1; used[side] += size; return side })
      sides = group.map(g => sideOf[g])
    } else {
      const turns = groupDirections(order.length)
      planes = group.map(g => turns[g])
      sides = group.map(() => 1)
    }
  }
  // An album's unrated tracks (all at the same height) go outwards in tracklist order, track 1 nearest the trunk.
  const chains = type !== 'music' ? undefined : {
    key: nodes.map(n => { const t = n.entity as Track; return t.score === undefined && t.albumId ? t.albumId : undefined }),
    rank: nodes.map(n => { const t = n.entity as Track; return (t.disc ?? 1) * 1000 + (t.number ?? 0) }),
  }
  const branches = autoAlign(nodes.map(n => positionOf(n.entity)), planes, sides, chains)
  const updates: Record<string, Record<string, Track | Simple>> = {}
  nodes.forEach((n, i) => {
    const table = updates[n.collection] ?? { ...s[n.collection] }
    table[n.id] = { ...n.entity, branch: branches[i] }
    updates[n.collection] = table
  })
  return updates as Partial<Persisted>
}

/** The artist for an album, found or made in `artists` (which it may change). */
/** An existing artist gets the catalogue's picture if they have none yet; returns their id. */
const withImage = (artists: Record<string, Artist>, artist: Artist, image?: string) => {
  if (image && !artist.image) artists[artist.id] = { ...artist, image }
  return artist.id
}

/**
 * The artist a catalogue reference means, if they're here: by catalogue id; failing that, by name, among artists
 * with no catalogue id (any artist, for a reference without one).
 */
export const matchArtist = (artists: Record<string, Artist>, ref: Pick<ArtistRef, 'name' | 'vendor'>): Artist | undefined => {
  const name = normalise(ref.name).toLowerCase()
  const all = Object.values(artists)
  return (ref.vendor && all.find(a => sameVendor(a.vendor, ref.vendor)))
    || all.find(a => (!ref.vendor || !a.vendor) && a.name.toLowerCase() === name)
}

const ensureArtist = (artists: Record<string, Artist>, ref: ArtistRef): string | undefined => {
  const name = normalise(ref.name)
  if (!name) return undefined
  const found = matchArtist(artists, ref)
  if (found) {
    // Matched by name: they get the catalogue id now.
    if (ref.vendor && !found.vendor) artists[found.id] = { ...found, vendor: ref.vendor }
    return withImage(artists, artists[found.id], ref.image)
  }
  const artist: Artist = { id: crypto.randomUUID(), name, ...(ref.vendor ? { vendor: ref.vendor } : {}), ...(ref.image ? { image: ref.image } : {}) }
  artists[artist.id] = artist
  return artist.id
}

const trackFrom = (album: Album, t: CatalogueTrack): Track => {
  const name = normalise(t.name) || 'Untitled'
  return {
    id: crypto.randomUUID(),
    name,
    shortTitle: shortTitle(name),
    ...(isSkit(name) ? { notASong: true } : {}),
    ...(album.image ? { image: album.image } : {}),
    ...(album.colors ? { colors: album.colors } : {}),
    ...(album.vendor ? { vendor: { name: album.vendor.name, id: t.id } } : {}),
    albumId: album.id,
    ...(album.artistId ? { artistId: album.artistId } : {}),
    disc: t.disc, number: t.number, durationMs: t.durationMs,
  }
}

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

  addTyped: (rawName, image) => {
    const s = get()
    const name = normalise(rawName)
    const type = s.activeType
    if (!type || !name || nameTaken(s, type, name)) return null
    const entity: Simple | Track = { id: crypto.randomUUID(), name, branch: newBranch(s, type, positionOf({})), since: Date.now(),
      ...(type === 'music' ? { shortTitle: shortTitle(name) } : {}), ...(image ? { image } : {}) }
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

  addSong: (song) => {
    const s = get()
    const name = normalise(song.name)
    if (!name) return null
    const tracks = { ...s.tracks }
    const existing = Object.values(s.tracks).find(t => sameVendor(t.vendor, song.vendor))
    const albumOf = (id?: string) => id ? s.albums[id] : undefined
    if (existing && albumOf(existing.albumId)) {
      const album = albumOf(existing.albumId)!
      if (album.addedAt === undefined) return { albumId: album.id, staged: true }
      if (existing.hidden || !existing.branch) {
        tracks[existing.id] = { ...existing, hidden: undefined, branch: existing.branch ?? newBranch(s, 'music', positionOf(existing)), since: existing.since ?? Date.now() }
        set({ tracks })
      }
      return { albumId: album.id }
    }
    const own = song.album && Object.values(s.albums).find(a => !a.misc && sameVendor(a.vendor, song.album))
    // Its album is staged: it comes with that album's tracks when they're put on the tree (its tracklist loading then).
    if (own && own.addedAt === undefined) return { albumId: own.id, staged: true }
    const artists = { ...s.artists }
    const artistId = ensureArtist(artists, song.artist)
    if (!artistId) return null
    const albums = { ...s.albums }
    const now = Date.now()
    let misc = Object.values(albums).find(a => a.misc && a.artistId === artistId)
    if (!misc) {
      misc = { id: crypto.randomUUID(), name: MISC_NAME, artistId, tracklistLoaded: true, stagedAt: now, addedAt: now, misc: true }
      albums[misc.id] = misc
    }
    const number = Math.max(0, ...tracksOf(s, misc.id).map(t => t.number ?? 0)) + 1
    const track: Track = {
      id: crypto.randomUUID(), name, shortTitle: shortTitle(name), ...(isSkit(name) ? { notASong: true } : {}), vendor: song.vendor, albumId: misc.id, artistId, disc: 1, number,
      ...(song.image ? { image: song.image } : {}), ...(song.durationMs !== undefined ? { durationMs: song.durationMs } : {}),
      branch: newBranch(s, 'music', positionOf({})), since: now,
    }
    tracks[track.id] = track
    set({ artists, albums, tracks: markLive(albums, tracks, [track.id]) })
    return { albumId: misc.id }
  },

  moveAlbum: (albumId, to) => {
    const s = get()
    const album = s.albums[albumId]
    if (!album) return null
    const artists = { ...s.artists }
    const target = 'id' in to ? (artists[to.id] ? to.id : undefined) : ensureArtist(artists, { name: to.name })
    if (!target || s.artistInfo[target]) return null // not loaded: their Misc and albums aren't known
    const from = album.artistId
    if (target === from) return albumId
    const albums = { ...s.albums }, tracks = { ...s.tracks }
    const theirMisc = album.misc ? Object.values(s.albums).find(a => a.misc && a.artistId === target) : undefined
    let landed = albumId
    const moving = tracksOf(s, albumId)
    if (theirMisc) {
      // One Misc per artist: the songs join theirs, after the ones already there, and this one goes.
      let n = Math.max(0, ...tracksOf(s, theirMisc.id).map(t => t.number ?? 0))
      for (const t of moving) tracks[t.id] = { ...t, albumId: theirMisc.id, artistId: target, disc: 1, number: ++n }
      delete albums[albumId]
      landed = theirMisc.id
    } else {
      albums[albumId] = { ...album, artistId: target }
      for (const t of moving) tracks[t.id] = { ...t, artistId: target }
    }
    // The artist it leaves goes if nothing of theirs is left.
    if (from && !Object.values(albums).some(a => a.artistId === from) && !Object.values(tracks).some(t => t.artistId === from)) delete artists[from]
    set({ artists, albums, tracks: markLive(albums, tracks, moving.map(t => t.id)) })
    return landed
  },

  addArtist: (name) => {
    const artists = { ...get().artists }
    const id = ensureArtist(artists, { name })
    if (id && !get().artists[id]) set({ artists })
    return id ?? null
  },

  createAlbum: (artistId, a) => {
    const s = get()
    const name = normalise(a.name)
    if (!name || !s.artists[artistId]) return null
    if (Object.values(s.albums).some(x => x.artistId === artistId && x.name.toLowerCase() === name.toLowerCase())) return null
    const album: Album = { id: crypto.randomUUID(), name, artistId, tracklistLoaded: true, stagedAt: Date.now(),
      ...(a.year !== undefined ? { year: a.year } : {}), ...(a.image ? { image: a.image } : {}) }
    const made = a.tracks.map(normalise).filter(Boolean).map((t, i) => trackFrom(album, { name: t, number: i + 1, disc: 1 } as CatalogueTrack))
    const albums = { ...s.albums, [album.id]: album }
    set({ albums, tracks: markLive(albums, { ...s.tracks, ...Object.fromEntries(made.map(t => [t.id, t])) }, made.map(t => t.id)) })
    // Straight onto the tree, unrated.
    get().addAlbumTracks(album.id)
    return album.id
  },

  addTypedSong: (song) => {
    const s = get()
    const name = normalise(song.name)
    if (!name) return null
    const artists = { ...s.artists }
    const artistId = 'id' in song.artist ? (s.artists[song.artist.id] ? song.artist.id : undefined) : ensureArtist(artists, { name: song.artist.name })
    if (!artistId) return null
    const albums = { ...s.albums }
    const now = Date.now()
    const ofArtist = Object.values(albums).filter(a => a.artistId === artistId)
    let album: Album | undefined
    if (song.album && 'id' in song.album) album = ofArtist.find(a => a.id === (song.album as { id: string }).id)
    else if (song.album && normalise(song.album.name)) {
      const albumName = normalise(song.album.name)
      // by name, Misc included (typing Singles means theirs)
      album = ofArtist.find(a => a.name.toLowerCase() === albumName.toLowerCase())
      if (!album) {
        album = { id: crypto.randomUUID(), name: albumName, artistId, tracklistLoaded: true, stagedAt: now, addedAt: now, ...(song.image ? { image: song.image } : {}) }
        albums[album.id] = album
      }
    } else {
      album = ofArtist.find(a => a.misc)
      if (!album) {
        album = { id: crypto.randomUUID(), name: MISC_NAME, artistId, tracklistLoaded: true, stagedAt: now, addedAt: now, misc: true }
        albums[album.id] = album
      }
    }
    if (!album || album.addedAt === undefined) return null
    const on = tracksOf(s, album.id)
    if (on.some(t => t.name.toLowerCase() === name.toLowerCase())) return null
    // After the album's last song, on its last disc.
    const disc = Math.max(1, ...on.map(t => t.disc ?? 1))
    const number = Math.max(0, ...on.filter(t => (t.disc ?? 1) === disc).map(t => t.number ?? 0)) + 1
    const image = song.image ?? album.image
    const track: Track = {
      id: crypto.randomUUID(), name, shortTitle: shortTitle(name), ...(isSkit(name) ? { notASong: true } : {}), albumId: album.id, artistId, disc, number,
      ...(image ? { image } : {}), branch: newBranch(s, 'music', positionOf({})), since: now,
    }
    set({ artists, albums, tracks: markLive(albums, { ...s.tracks, [track.id]: track }, [track.id]) })
    return { albumId: album.id, trackId: track.id }
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
    let tracks = { ...s.tracks }
    const added: string[] = []
    if (!album.tracklistLoaded) {
      album.tracklistLoaded = true
      for (const t of details.tracks) {
        const vendor = album.vendor ? { name: album.vendor.name, id: t.id } : undefined
        const existing = vendor ? Object.values(tracks).find(x => sameVendor(x.vendor, vendor)) : undefined
        if (!existing) { const track = trackFrom(album, t); tracks[track.id] = track; added.push(track.id) }
        // a track that outlived an earlier copy of this album, or was added on its own (to Misc) before it: it moves
        // here, score and all
        else if (!existing.albumId || s.albums[existing.albumId]?.misc) {
          tracks[existing.id] = { ...existing, albumId, disc: t.disc, number: t.number, ...(album.image ? { image: album.image } : {}) }
        }
      }
    }
    const albums = { ...s.albums, [albumId]: album }
    // A Misc album left empty by that goes.
    for (const a of Object.values(s.albums)) {
      if (a.misc && !Object.values(tracks).some(t => t.albumId === a.id)) delete albums[a.id]
    }
    // Live recordings of songs they already have, either way round (state/live.ts).
    tracks = markLive(albums, tracks, added)
    set({ artists, albums, tracks })
  },

  setColors: (id, colors) => {
    const s = get()
    const f = find(s, id)
    if (!f) return
    set({ [f.collection]: { ...s[f.collection], [id]: { ...f.entity, colors } } } as Partial<State>)
  },

  setImage: (id, image) => {
    const s = get()
    const f = find(s, id)
    if (!f || f.entity.image === image) return
    const fresh = <T extends { image?: string, colors?: string[] }>(e: T): T => { const { colors: _, ...rest } = e; return { ...rest, image } as T }
    // An album's picture goes on every one of its songs too.
    if (f.collection === 'albums') {
      const tracks = { ...s.tracks }
      for (const t of Object.values(s.tracks)) if (t.albumId === id) tracks[t.id] = fresh(t)
      return set({ albums: { ...s.albums, [id]: fresh(f.entity) }, tracks })
    }
    set({ [f.collection]: { ...s[f.collection], [id]: fresh(f.entity) } } as Partial<State>)
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
        // A short title given is kept as typed (blank: none, the rater shows the full name). Not given, a renamed
        // track's short title follows its name, unless it was set to something else.
        const short = t.shortTitle !== undefined ? normalise(t.shortTitle).slice(0, SHORT_TITLE_MAX) || undefined
          : track.name !== names[i] && (track.shortTitle === undefined || track.shortTitle === shortTitle(track.name)) ? shortTitle(names[i])
          : track.shortTitle
        // Not a song: off the rater and counted for nothing (its score is kept, for if it's unmarked).
        const notASong = t.notASong !== undefined ? t.notASong || undefined : track.notASong
        // Live (a song they already have): counts for the album, not the artist.
        const live = t.live !== undefined ? t.live || undefined : track.live
        if (track.name !== names[i] || track.number !== number || track.shortTitle !== short || !!track.notASong !== !!notASong || !!track.live !== !!live) {
          const next: Track = { ...track, name: names[i], number, shortTitle: short, notASong, live }
          if (short === undefined) delete next.shortTitle
          if (!notASong) delete next.notASong
          if (!live) delete next.live
          tracks[t.id] = next
        }
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

  unrate: (id) => {
    const s = get()
    const f = find(s, id)
    if (!f || (f.collection !== 'tracks' && f.collection !== 'movies' && f.collection !== 'books') || f.entity.score === undefined) return
    const { score: _, ...rest } = f.entity
    set({ [f.collection]: { ...s[f.collection], [id]: rest } } as Partial<State>)
  },

  autoAlignBoard: () => {
    const s = get()
    if (s.activeType) set(aligned(s, s.activeType))
  },

  flattenBoard: () => {
    const s = get()
    if (s.activeType) set(aligned(s, s.activeType, true))
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

/**
 * The saved collections as far as they're loaded, with the summaries of artists not loaded yet (board.ts Library),
 * re-rendering only when one of them changes (lookups like `find` then work on this).
 */
export const usePersisted = (): Persisted & { artistInfo: Record<string, ArtistInfo> } =>
  useStore(useShallow(s => ({ artists: s.artists, albums: s.albums, tracks: s.tracks, movies: s.movies, books: s.books, artistInfo: s.artistInfo })))
