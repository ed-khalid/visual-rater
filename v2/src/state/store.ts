import { create } from 'zustand'
import type { AlbumDetails, Track } from '../shared/suggestions'
import { assignBranches, autoAlign, chooseBranch, clashes, directionNear, MAX_BRANCH_LENGTH, MIN_BRANCH_LENGTH, NEAR_POSITION, preferredDirection, ringLength } from './layout'

import type { Board, Item, ItemType, MusicAlbum, MusicDetails, Persisted, Placement, VendorRef } from '../shared/model'
export type { Board, Item, ItemType, MusicDetails, Persisted, Placement, Staged, VendorRef } from '../shared/model'

/** Details that can be filled in on an item after it's added. */
export type ItemDetails = Pick<Item, 'image' | 'colors'>

/** An album's artist as the catalogue gives it: matched to an artist item by catalogue id, or by name without one. */
export type ArtistRef = { name: string, vendor?: VendorRef }

/** Where a newly added item lands until it's dragged. */
export const NEW_ITEM_POSITION = 0.5

/** The starting types. Users can add their own alongside these. */
export const BUILT_IN_TYPES: ItemType[] = [
  { id: 'music', name: 'MUSIC', builtIn: true },
  { id: 'movies', name: 'MOVIES', builtIn: true },
  { id: 'books', name: 'BOOKS', builtIn: true },
]

export type State = Persisted & {
  /** null means no board is open: the type picker is showing. */
  activeBoardId: string | null
}

type Actions = {
  /** Opens the board for a type, creating it the first time. */
  openType: (typeId: string) => void
  /** Adds a custom type and returns it; if one with that name exists (any case), returns that instead. Null for a blank name. */
  addType: (name: string) => ItemType | null
  /** Back to the type picker. */
  closeBoard: () => void
  /**
   * Adds an item to the open board: placed on the axis, or with `stage: true` into the staging tray.
   * Catalogue picks pass `music` (with its vendor id), and albums their `artist`. If an item for that catalogue
   * entry already exists off the board (an album's artist, say), that item is put on the board instead of a new one.
   * Returns the item, or null if no board is open, the name is blank, or it's already on the board, placed or
   * staged (same catalogue entry, or for typed items the same name).
   */
  addItem: (name: string, extra?: { image?: string, music?: MusicDetails, artist?: ArtistRef }, opts?: { stage?: boolean }) => Item | null
  /** Fills in details on an existing item (e.g. its cover's colour once worked out). Undefined fields are left alone. */
  setItemDetails: (itemId: string, details: Partial<ItemDetails>) => void
  /**
   * Fills in an album from the catalogue: artist, year and cover where they're still missing, and, the first time,
   * its tracklist, each track becoming its own item (not on any board until added).
   */
  setAlbumDetails: (albumId: string, details: AlbumDetails) => void
  /**
   * User edits to an item: a new title, and for albums a year (null clears it) or tracklist (its track items, in
   * order, with their names). Titles and track names are trimmed; blank ones are rejected (returns false, nothing
   * changes). Tracks are renumbered 1, 2, 3… within each disc, renaming one renames it wherever it's placed, and
   * tracks left out are deleted, from every board too.
   */
  editItem: (itemId: string, edit: { name?: string, year?: number | null, tracks?: { id: string, name: string }[] }) => boolean
  /**
   * Puts a staged album's tracks on the open board (each is its own item on the tree), and moves the album from the
   * tray to the added column. Tracks already on the board are skipped. Returns how many tracks were added, or null
   * if the album isn't staged here.
   */
  addAlbumTracks: (albumId: string) => number | null
  /**
   * Moves a placed item on the open board: `position` up or down the trunk (0–1), `length` of its branch. Both are
   * clamped. If the new height puts its branch too close to another one, only this item's branch turns, to the
   * nearest free direction; nothing else moves.
   */
  movePlacement: (itemId: string, move: { position?: number, length?: number }) => void
  /**
   * Re-lays out every item on the open board's tree so as many as possible sit on the main plane (left and right
   * of the trunk, facing the starting view), lengthening or shortening stems to keep fruit apart, and swinging
   * items to other planes once a stem would pass the threshold (see layout.autoAlign). Heights never change.
   */
  autoAlignBoard: () => void
  /**
   * Takes an item off the open board, whether it's staged, an added album, or placed on the axis, then drops
   * whatever nothing needs any more (see `prune`).
   */
  removeFromBoard: (itemId: string) => void
}

const normalise = (name: string) => name.trim().replace(/\s+/g, ' ')

export const initialState = (): State => ({
  types: Object.fromEntries(BUILT_IN_TYPES.map(t => [t.id, t])),
  items: {},
  boards: {},
  placements: [],
  staged: [],
  added: [],
  activeBoardId: null,
})

/** Items on the open board, placed or staged. */
const itemsOnActiveBoard = (s: State) => [
  ...s.placements.filter(p => p.boardId === s.activeBoardId),
  ...s.staged.filter(p => p.boardId === s.activeBoardId),
  ...s.added.filter(p => p.boardId === s.activeBoardId),
].map(p => s.items[p.itemId]).filter(Boolean)

const sameVendor = (a: VendorRef | undefined, b: VendorRef) => a?.name === b.name && a.id === b.id

/** The item for this catalogue entry, on a board or not. */
export const findByVendor = (items: Record<string, Item>, kind: MusicDetails['kind'], vendor: VendorRef) =>
  Object.values(items).find(i => i.music?.kind === kind && sameVendor(i.music.vendor, vendor))

const trackOrder = (i: Item) => i.music?.kind === 'track' ? [i.music.disc ?? 0, i.music.number ?? 0] : [0, 0]

/** An album's tracks (its tracklist), in disc then track order. */
export const tracksOf = (items: Record<string, Item>, albumId: string): Item[] =>
  Object.values(items)
    .filter(i => i.music?.kind === 'track' && i.music.albumId === albumId)
    .sort((a, b) => { const [ad, an] = trackOrder(a), [bd, bn] = trackOrder(b); return ad - bd || an - bn })

/** The artist of an album or track, if it has one. */
export const artistOf = (items: Record<string, Item>, item: Item | undefined) =>
  item?.music && item.music.kind !== 'artist' && item.music.artistId ? items[item.music.artistId] : undefined

/** The album a track is on, if it's still there. */
export const albumOf = (items: Record<string, Item>, item: Item | undefined) =>
  item?.music?.kind === 'track' && item.music.albumId ? items[item.music.albumId] : undefined

/**
 * The artist item for an album or track, found or made in `items` (which it may change): the one with the same
 * catalogue id; failing that, one with the same name and no catalogue id yet (which gains this one). Undefined for a
 * blank name.
 */
const ensureArtist = (items: Record<string, Item>, typeId: string, ref: ArtistRef): string | undefined => {
  const name = normalise(ref.name)
  if (!name) return undefined
  const artists = Object.values(items).filter(i => i.typeId === typeId && i.music?.kind === 'artist')
  const sameName = (i: Item) => i.name.toLowerCase() === name.toLowerCase()
  if (ref.vendor) {
    const byVendor = artists.find(i => sameVendor(i.music!.vendor, ref.vendor!))
    if (byVendor) return byVendor.id
    const byName = artists.find(i => !i.music!.vendor && sameName(i))
    if (byName) {
      items[byName.id] = { ...byName, music: { kind: 'artist', vendor: ref.vendor } }
      return byName.id
    }
  } else {
    const byName = artists.find(sameName)
    if (byName) return byName.id
  }
  const artist: Item = { id: crypto.randomUUID(), typeId, name, music: { kind: 'artist', ...(ref.vendor ? { vendor: ref.vendor } : {}) } }
  items[artist.id] = artist
  return artist.id
}

/**
 * Keeps only the items something still needs: anything on a board, the tracks of an album that's kept, and the
 * artists of kept albums and tracks. A track that outlives its album loses its album link, as in the database.
 */
const prune = (items: Record<string, Item>, onBoards: { itemId: string }[]): Record<string, Item> => {
  const keep = new Set(onBoards.map(x => x.itemId).filter(id => items[id]))
  for (const i of Object.values(items)) if (i.music?.kind === 'track' && i.music.albumId && keep.has(i.music.albumId)) keep.add(i.id)
  for (const id of [...keep]) { const artist = artistOf(items, items[id]); if (artist) keep.add(artist.id) }
  const out: Record<string, Item> = {}
  for (const id of keep) {
    const i = items[id]
    if (i.music?.kind === 'track' && i.music.albumId && !keep.has(i.music.albumId)) {
      const { albumId: _, ...music } = i.music
      out[id] = { ...i, music }
    } else out[id] = i
  }
  return out
}

/** Whether an item with this name is on the open board, placed or staged. */
export const isOnActiveBoard = (s: State, name: string) => {
  const wanted = normalise(name).toLowerCase()
  return itemsOnActiveBoard(s).some(item => item.name.toLowerCase() === wanted)
}

/** Whether this catalogue entry is on the open board: 'placed', 'staged', or false. */
export const vendorStatusOnActiveBoard = (s: State, kind: MusicDetails['kind'], vendor: VendorRef): 'placed' | 'staged' | false => {
  const item = findByVendor(s.items, kind, vendor)
  if (!item) return false
  const here = (p: { boardId: string, itemId: string }) => p.boardId === s.activeBoardId && p.itemId === item.id
  return s.placements.some(here) || s.added.some(here) ? 'placed' : s.staged.some(here) ? 'staged' : false
}

/** The scoring scale: 0 at the bottom of the trunk, 100 at the top. */
export const SCORE_MIN = 0
export const SCORE_MAX = 100

/** A placement's score (0–100, continuous) from its position on the trunk (0–1). */
export const positionToScore = (position: number) => SCORE_MIN + Math.min(1, Math.max(0, position)) * (SCORE_MAX - SCORE_MIN)
/** The position (0–1) for a score (0–100). */
export const scoreToPosition = (score: number) => Math.min(1, Math.max(0, (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)))
/** A score as shown in the UI: a whole number. */
export const formatScore = (score: number) => String(Math.round(score))

/** How an item's rating reads in the UI: UNRATED until it has a position on the trunk, then its 0–100 score. */
export const ratingLabel = (s: State, itemId: string) => {
  const placed = s.placements.find(p => p.boardId === s.activeBoardId && p.itemId === itemId)
  return placed ? formatScore(positionToScore(placed.position)) : 'UNRATED'
}

export const findType = (s: State, name: string) => {
  const wanted = normalise(name).toUpperCase()
  return Object.values(s.types).find(t => t.name === wanted)
}

/** Upgrades state saved in localStorage by an older version (used when importing it into the database). */
export const migrateState = (persisted: unknown, version: number): State => {
  // v1 had no item types and only ever held throwaway prototype data, so it's dropped.
  if (version < 2) return initialState()
  let s = persisted as State
  // v2 → v3 added the staging tray.
  if (version < 3) s = { ...s, staged: [] }
  // v3 → v4 added the column of albums whose tracks are on the board.
  if (version < 4) s = { ...s, added: [] }
  // v4 → v5 stores each placement's branch; lay out each board exactly as it was being drawn.
  if (version < 5) s = { ...s, placements: withStoredBranches(s.placements as Omit<Placement, 'angle' | 'length' | 'ring'>[]) }
  // Everything kept in localStorage (up to v5) predates the music tables (server/db/003): convert its items.
  if (version <= 5) s = { ...s, items: fromLegacyItems(s.items as unknown as Record<string, LegacyItem>) }
  return s
}

/** How items were kept before the music tables: catalogue ids, artist names and tracklists on the item itself. */
type LegacyItem = {
  id: string, typeId: string, name: string, image?: string, colors?: string[]
  source?: { provider: 'spotify', kind: 'artist' | 'album' | 'track', id: string }
  artist?: string, year?: number, tracks?: Track[], albumId?: string
}

/** The same conversion as server/db/003.music-tables.sql, for data that never reached the database. */
const fromLegacyItems = (old: Record<string, LegacyItem>): Record<string, Item> => {
  const items: Record<string, Item> = {}
  const legacy = Object.values(old)
  for (const o of legacy) {
    const item: Item = { id: o.id, typeId: o.typeId, name: o.name }
    if (o.image) item.image = o.image
    if (o.colors) item.colors = o.colors
    const vendor = o.source ? { vendor: { name: o.source.provider, id: o.source.id } } : {}
    const kind = o.source?.kind ?? (o.tracks ? 'album' : o.albumId ? 'track' : undefined)
    if (kind === 'artist') item.music = { kind, ...vendor }
    if (kind === 'album') item.music = { kind, ...vendor, ...(o.year !== undefined ? { year: o.year } : {}), tracklistLoaded: o.tracks !== undefined }
    if (kind === 'track') {
      const entry = o.albumId ? old[o.albumId]?.tracks?.find(t => o.source ? t.id === o.source.id : t.name === o.name) : undefined
      item.music = {
        kind, ...vendor, ...(o.albumId && old[o.albumId] ? { albumId: o.albumId } : {}),
        ...(entry ? { disc: entry.disc, number: entry.number, durationMs: entry.durationMs } : {}),
      }
    }
    items[o.id] = item
  }
  for (const o of legacy) {
    const music = items[o.id].music
    if (o.artist && music && music.kind !== 'artist') {
      const artistId = ensureArtist(items, o.typeId, { name: o.artist })
      if (artistId) items[o.id] = { ...items[o.id], music: { ...music, artistId } }
    }
  }
  for (const o of legacy) {
    const album = items[o.id]
    if (album.music?.kind !== 'album' || !o.tracks) continue
    const existing = tracksOf(items, o.id)
    for (const t of o.tracks) {
      const vendor = album.music.vendor ? { name: album.music.vendor.name, id: t.id } : undefined
      if (existing.some(i => i.music?.kind === 'track' && (vendor ? i.music.vendor?.id === t.id : i.name === t.name))) continue
      if (vendor && findByVendor(items, 'track', vendor)) continue
      const track = trackItem(album, album.music, t)
      items[track.id] = track
    }
  }
  return items
}

/** A new track item for an album, from a catalogue tracklist entry. */
const trackItem = (album: Item, music: MusicAlbum, t: Track): Item => ({
  id: crypto.randomUUID(),
  typeId: album.typeId,
  name: normalise(t.name) || 'Untitled',
  ...(album.image ? { image: album.image } : {}),
  music: {
    kind: 'track',
    ...(music.vendor ? { vendor: { name: music.vendor.name, id: t.id } } : {}),
    albumId: album.id,
    ...(music.artistId ? { artistId: music.artistId } : {}),
    disc: t.disc, number: t.number, durationMs: t.durationMs,
  },
})

/** Branches for placements saved before branches were stored: per board, in placement order, as drawn then. */
const withStoredBranches = (placements: Omit<Placement, 'angle' | 'length' | 'ring'>[]): Placement[] => {
  const out = new Map<Omit<Placement, 'angle' | 'length' | 'ring'>, Placement>()
  for (const boardId of new Set(placements.map(p => p.boardId))) {
    const onBoard = placements.filter(p => p.boardId === boardId).sort((a, b) => a.placedAt - b.placedAt)
    const branches = assignBranches(onBoard.map(p => p.position), NEAR_POSITION)
    onBoard.forEach((p, i) => out.set(p, { ...p, ...branches[i] }))
  }
  return placements.map(p => out.get(p)!)
}

/** A new placement on a board, with a branch that doesn't clash with the ones already there. */
const newPlacement = (placements: Placement[], boardId: string, itemId: string, position: number, placedAt: number): Placement => {
  const onBoard = placements.filter(p => p.boardId === boardId)
  const branch = chooseBranch(position, onBoard.map(p => ({ y: p.position, angle: p.angle, ring: p.ring })), NEAR_POSITION, preferredDirection(onBoard.length))
  return { boardId, itemId, position, placedAt, ...branch }
}

/**
 * The app's state. Saved to the database by state/remote.ts, which loads it on startup and sends every change to
 * the API server; this store itself only holds it in memory.
 */
export const useStore = create<State & Actions>()((set, get) => ({
  ...initialState(),

  openType: (typeId) => {
    const s = get()
    const type = s.types[typeId]
    if (!type) return
    const existing = Object.values(s.boards).find(b => b.typeId === typeId)
    if (existing) return set({ activeBoardId: existing.id })
    const board: Board = { id: crypto.randomUUID(), typeId, name: type.name, axis: 'linear', bands: [] }
    set({ boards: { ...s.boards, [board.id]: board }, activeBoardId: board.id })
  },

  addType: (rawName) => {
    const name = normalise(rawName).toUpperCase()
    if (!name) return null
    const s = get()
    const existing = findType(s, name)
    if (existing) return existing
    const type: ItemType = { id: crypto.randomUUID(), name, builtIn: false }
    set({ types: { ...s.types, [type.id]: type } })
    return type
  },

  closeBoard: () => set({ activeBoardId: null }),

  setItemDetails: (itemId, details) => {
    const s = get()
    const item = s.items[itemId]
    if (!item) return
    const defined = Object.fromEntries(Object.entries(details).filter(([, v]) => v !== undefined))
    set({ items: { ...s.items, [itemId]: { ...item, ...defined } } })
  },

  setAlbumDetails: (albumId, details) => {
    const s = get()
    const album = s.items[albumId]
    if (album?.music?.kind !== 'album') return
    const items = { ...s.items }
    const music: MusicAlbum = { ...album.music }
    if (!music.artistId && details.artist) {
      const artistId = ensureArtist(items, album.typeId, { name: details.artist, ...(details.artistId ? { vendor: { name: 'spotify', id: details.artistId } } : {}) })
      if (artistId) music.artistId = artistId
    }
    if (music.year === undefined && details.year !== undefined) music.year = details.year
    const next: Item = { ...album, ...(album.image || !details.image ? {} : { image: details.image }), music }
    if (!music.tracklistLoaded) {
      music.tracklistLoaded = true
      for (const t of details.tracks) {
        const existing = music.vendor ? findByVendor(items, 'track', { name: music.vendor.name, id: t.id }) : undefined
        if (!existing) {
          const track = trackItem(next, music, t)
          items[track.id] = track
        } else if (existing.music?.kind === 'track' && !existing.music.albumId) {
          // A track that outlived an earlier copy of this album: it belongs to this one now.
          items[existing.id] = { ...existing, music: { ...existing.music, albumId } }
        }
      }
    }
    items[albumId] = next
    set({ items })
  },

  editItem: (itemId, edit) => {
    const s = get()
    const item = s.items[itemId]
    if (!item) return false
    const items = { ...s.items }
    const next: Item = { ...item }
    if (edit.name !== undefined) {
      const name = normalise(edit.name)
      if (!name) return false
      next.name = name
    }
    if (edit.year !== undefined) {
      if (next.music?.kind !== 'album') return false
      const music = { ...next.music }
      if (edit.year === null) delete music.year
      else if (!Number.isInteger(edit.year)) return false
      else music.year = edit.year
      next.music = music
    }
    let removed = new Set<string>()
    if (edit.tracks !== undefined) {
      if (next.music?.kind !== 'album') return false
      const names = edit.tracks.map(t => normalise(t.name))
      if (names.some(n => !n)) return false
      const kept = new Set(edit.tracks.map(t => t.id))
      const perDisc = new Map<number, number>()
      edit.tracks.forEach((t, i) => {
        const track = s.items[t.id]
        if (track?.music?.kind !== 'track' || track.music.albumId !== itemId) return
        const disc = track.music.disc ?? 0
        const number = (perDisc.get(disc) ?? 0) + 1
        perDisc.set(disc, number)
        if (track.name !== names[i] || track.music.number !== number) items[t.id] = { ...track, name: names[i], music: { ...track.music, number } }
      })
      removed = new Set(tracksOf(s.items, itemId).filter(t => !kept.has(t.id)).map(t => t.id))
    }
    items[itemId] = next
    for (const id of removed) delete items[id]
    if (removed.size === 0) set({ items })
    else {
      const stays = (x: { itemId: string }) => !removed.has(x.itemId)
      set({ items, placements: s.placements.filter(stays), staged: s.staged.filter(stays), added: s.added.filter(stays) })
    }
    return true
  },

  addAlbumTracks: (albumId) => {
    const s = get()
    const board = s.activeBoardId ? s.boards[s.activeBoardId] : null
    const album = s.items[albumId]
    if (!board || !album || !s.staged.some(st => st.itemId === albumId && st.boardId === board.id)) return null
    const now = Date.now()
    const onBoard = new Set([...s.placements, ...s.staged, ...s.added].filter(x => x.boardId === board.id).map(x => x.itemId))
    const placements = [...s.placements]
    let count = 0
    for (const track of tracksOf(s.items, albumId)) {
      if (onBoard.has(track.id)) continue
      // placedAt increases by track, so the tree lays them out in tracklist order
      placements.push(newPlacement(placements, board.id, track.id, NEW_ITEM_POSITION, now + count))
      count++
    }
    set({
      placements,
      staged: s.staged.filter(st => !(st.itemId === albumId && st.boardId === board.id)),
      added: [...s.added, { boardId: board.id, itemId: albumId, stagedAt: now }],
    })
    return count
  },

  movePlacement: (itemId, move) => {
    const s = get()
    const index = s.placements.findIndex(p => p.itemId === itemId && p.boardId === s.activeBoardId)
    if (index < 0) return
    const current = s.placements[index]
    let next: Placement = { ...current }
    if (move.position !== undefined) next.position = Math.min(1, Math.max(0, move.position))
    if (move.position !== undefined) {
      const others = s.placements.filter((p, i) => i !== index && p.boardId === current.boardId).map(p => ({ y: p.position, angle: p.angle, ring: p.ring }))
      if (clashes(next.position, next, others, NEAR_POSITION)) {
        const branch = chooseBranch(next.position, others, NEAR_POSITION, directionNear(current.angle, current.ring))
        const custom = current.length !== ringLength(current.ring)
        next = { ...next, angle: branch.angle, ring: branch.ring, length: custom ? current.length : branch.length }
      }
    }
    if (move.length !== undefined) next.length = Math.min(MAX_BRANCH_LENGTH, Math.max(MIN_BRANCH_LENGTH, move.length))
    const placements = [...s.placements]
    placements[index] = next
    set({ placements })
  },

  autoAlignBoard: () => {
    const s = get()
    const indexes = s.placements.flatMap((p, i) => p.boardId === s.activeBoardId ? [i] : [])
    // Ties at the same height keep placement order, so the layout doesn't reshuffle for no reason.
    indexes.sort((a, b) => s.placements[a].placedAt - s.placements[b].placedAt)
    const branches = autoAlign(indexes.map(i => s.placements[i].position))
    const placements = [...s.placements]
    indexes.forEach((i, k) => { placements[i] = { ...placements[i], ...branches[k] } })
    set({ placements })
  },

  removeFromBoard: (itemId) => {
    const s = get()
    const here = (x: { boardId: string, itemId: string }) => x.itemId === itemId && x.boardId === s.activeBoardId
    const staged = s.staged.filter(x => !here(x))
    const added = s.added.filter(x => !here(x))
    const placements = s.placements.filter(x => !here(x))
    set({ staged, added, placements, items: prune(s.items, [...staged, ...added, ...placements]) })
  },

  addItem: (rawName, extra = {}, opts = {}) => {
    const name = normalise(rawName)
    const s = get()
    const board = s.activeBoardId ? s.boards[s.activeBoardId] : null
    if (!board || !name) return null
    const music = extra.music
    // Catalogue picks are matched by their catalogue id (two artists can share a name); typed items by name.
    if (music?.vendor ? vendorStatusOnActiveBoard(s, music.kind, music.vendor) : isOnActiveBoard(s, name)) return null
    const items = { ...s.items }
    const existing = music?.vendor ? findByVendor(s.items, music.kind, music.vendor) : undefined
    let item: Item
    if (existing) {
      item = existing.image || !extra.image ? existing : { ...existing, image: extra.image }
    } else {
      item = { id: crypto.randomUUID(), typeId: board.typeId, name, ...(extra.image ? { image: extra.image } : {}) }
      if (music) {
        const artistId = music.kind !== 'artist' && extra.artist ? ensureArtist(items, board.typeId, extra.artist) : undefined
        item.music = artistId && music.kind !== 'artist' ? { ...music, artistId } : music
      }
    }
    items[item.id] = item
    const now = Date.now()
    set(opts.stage
      ? { items, staged: [...s.staged, { boardId: board.id, itemId: item.id, stagedAt: now }] }
      : { items, placements: [...s.placements, newPlacement(s.placements, board.id, item.id, NEW_ITEM_POSITION, now)] })
    return item
  },
}))

/** Key and version of the data v2 kept in localStorage before it had a database, for the one-time import. */
export const LEGACY_STORAGE_KEY = 'visual-rater-v2'
export const LEGACY_STORAGE_VERSION = 5
