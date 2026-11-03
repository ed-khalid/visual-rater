import { beforeEach, describe, expect, test } from 'vitest'
import { assignBranches, BRANCH_LENGTH, MAX_BRANCH_LENGTH, MIN_BRANCH_LENGTH, NEAR_POSITION } from './layout'
import type { AlbumDetails } from '../shared/suggestions'
import { artistOf, formatScore, initialState, migrateState, positionToScore, ratingLabel, scoreToPosition, tracksOf, useStore, vendorStatusOnActiveBoard } from './store'

const s = () => useStore.getState()
const spotify = (id: string) => ({ name: 'spotify' as const, id })
const albumMusic = (vendorId?: string, extra: { year?: number } = {}) =>
  ({ kind: 'album' as const, ...(vendorId ? { vendor: spotify(vendorId) } : {}), tracklistLoaded: false, ...extra })
const albumDetails = (extra: Partial<AlbumDetails> = {}): AlbumDetails => ({
  id: 'k', name: 'Kid A', artist: 'Radiohead', artistId: 'rh', year: 2000,
  tracks: [
    { id: 't1', name: 'Everything In Its Right Place', number: 1, disc: 1, durationMs: 251426 },
    { id: 't2', name: 'Kid A', number: 2, disc: 1, durationMs: 284000 },
  ],
  ...extra,
})

beforeEach(() => useStore.setState(initialState()))

describe('types and boards', () => {
  test('starts on the type picker with MUSIC, MOVIES and BOOKS', () => {
    expect(s().activeBoardId).toBeNull()
    expect(Object.values(s().types).map(t => t.name)).toEqual(['MUSIC', 'MOVIES', 'BOOKS'])
  })

  test('opening a type creates its board once, then reuses it', () => {
    s().openType('music')
    const first = s().activeBoardId!
    expect(s().boards[first]).toMatchObject({ typeId: 'music', name: 'MUSIC' })
    s().closeBoard()
    expect(s().activeBoardId).toBeNull()
    s().openType('music')
    expect(s().activeBoardId).toBe(first)
    expect(Object.keys(s().boards)).toHaveLength(1)
  })

  test('each type has its own board', () => {
    s().openType('music')
    const music = s().activeBoardId
    s().openType('books')
    expect(s().activeBoardId).not.toBe(music)
    expect(s().boards[s().activeBoardId!].typeId).toBe('books')
  })

  test('opening an unknown type does nothing', () => {
    s().openType('nope')
    expect(s().activeBoardId).toBeNull()
  })

  test('custom types are upper-cased, and a repeated name returns the existing type', () => {
    const games = s().addType('  video   games ')!
    expect(games).toMatchObject({ name: 'VIDEO GAMES', builtIn: false })
    expect(s().addType('Video Games')!.id).toBe(games.id)
    expect(s().addType('music')!.id).toBe('music')
    expect(s().addType('   ')).toBeNull()
    expect(Object.keys(s().types)).toHaveLength(4)
  })
})

describe('addItem', () => {
  test('needs an open board', () => {
    expect(s().addItem('Radiohead')).toBeNull()
    expect(s().placements).toHaveLength(0)
  })

  test('adds to the open board, takes the board\'s type, lands mid-axis', () => {
    s().openType('music')
    const item = s().addItem('  Radiohead ')!
    expect(item).toMatchObject({ name: 'Radiohead', typeId: 'music' })
    expect(s().placements).toEqual([expect.objectContaining({ boardId: s().activeBoardId, itemId: item.id, position: 0.5 })])
  })

  test('duplicates are per board, ignoring case', () => {
    s().openType('music')
    s().addItem('Dune')
    expect(s().addItem('dune')).toBeNull()
    s().openType('books')
    expect(s().addItem('Dune')).not.toBeNull()
  })

  test('catalogue picks keep their image and vendor id, and are matched by vendor id, not name', () => {
    s().openType('music')
    const music = { kind: 'artist' as const, vendor: spotify('abc') }
    expect(s().addItem('Nirvana', { image: 'img.jpg', music })).toMatchObject({ name: 'Nirvana', image: 'img.jpg', music })
    expect(s().addItem('Nirvana (again)', { music })).toBeNull()
    // a different band with the same name is a different artist
    expect(s().addItem('Nirvana', { music: { kind: 'artist', vendor: spotify('other') } })).not.toBeNull()
  })

  test('the item id is always ours, never the vendor\'s', () => {
    s().openType('music')
    const item = s().addItem('Nirvana', { music: { kind: 'artist', vendor: spotify('abc') } })!
    expect(item.id).not.toBe('abc')
    expect(item.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  test('staging: goes to the tray, not the axis, and still counts as on the board', () => {
    s().openType('music')
    const music = albumMusic('okc')
    const item = s().addItem('OK Computer', { image: 'okc.jpg', music }, { stage: true })!
    expect(s().placements).toHaveLength(0)
    expect(s().staged).toEqual([expect.objectContaining({ boardId: s().activeBoardId, itemId: item.id })])
    expect(vendorStatusOnActiveBoard(s(), 'album', spotify('okc'))).toBe('staged')
    expect(s().addItem('OK Computer', { music }, { stage: true })).toBeNull()
    expect(s().addItem('ok computer')).toBeNull() // typed duplicate of a staged name
  })

  test('staged items belong to their board', () => {
    s().openType('music')
    s().addItem('Kid A', {}, { stage: true })
    s().openType('books')
    expect(s().addItem('Kid A')).not.toBeNull()
  })
})

describe('artists', () => {
  test('an album gets an artist item, matched by vendor id, or by name when there is none', () => {
    s().openType('music')
    const radiohead = { name: 'Radiohead', vendor: spotify('rh') }
    const kidA = s().addItem('Kid A', { music: albumMusic('kida'), artist: radiohead }, { stage: true })!
    const amnesiac = s().addItem('Amnesiac', { music: albumMusic('amn'), artist: radiohead }, { stage: true })!
    const artist = artistOf(s().items, kidA)!
    expect(artist).toMatchObject({ name: 'Radiohead', music: { kind: 'artist', vendor: spotify('rh') } })
    expect(artistOf(s().items, amnesiac)!.id).toBe(artist.id)
    const typed = s().addItem('Pablo Honey', { music: albumMusic(), artist: { name: 'radiohead' } }, { stage: true })!
    expect(artistOf(s().items, typed)!.id).toBe(artist.id)
    // not on the board until it's added itself, and then it's that same item
    expect(vendorStatusOnActiveBoard(s(), 'artist', spotify('rh'))).toBe(false)
    expect(s().addItem('Radiohead', { music: { kind: 'artist', vendor: spotify('rh') } })!.id).toBe(artist.id)
    expect(s().addItem('Radiohead', { music: { kind: 'artist', vendor: spotify('rh') } })).toBeNull()
  })

  test('an artist with no vendor id gains one when a catalogue album names it', () => {
    s().openType('music')
    const typed = s().addItem('Kid A', { music: albumMusic(), artist: { name: 'Radiohead' } }, { stage: true })!
    const artistId = artistOf(s().items, typed)!.id
    s().addItem('Amnesiac', { music: albumMusic('amn'), artist: { name: 'Radiohead', vendor: spotify('rh') } }, { stage: true })
    expect(s().items[artistId].music).toEqual({ kind: 'artist', vendor: spotify('rh') })
  })

  test('an artist goes when the last album pointing at it does', () => {
    s().openType('music')
    const album = s().addItem('Kid A', { music: albumMusic('kida'), artist: { name: 'Radiohead', vendor: spotify('rh') } }, { stage: true })!
    const artistId = artistOf(s().items, album)!.id
    s().removeFromBoard(album.id)
    expect(s().items[artistId]).toBeUndefined()
  })
})

describe('persistence migration', () => {
  const migrate = migrateState

  test('v2 data keeps everything and gains an empty tray and added column', () => {
    const { staged: _, added: __, ...v2 } = { ...initialState(), placements: [{ boardId: 'b', itemId: 'i', position: 0.5, placedAt: 1 }] }
    const out = migrate(v2, 2)
    expect(out.placements).toHaveLength(1)
    expect(out.staged).toEqual([])
    expect(out.added).toEqual([])
  })

  test('v3 data keeps its tray and gains an empty added column', () => {
    const { added: _, ...v3 } = { ...initialState(), staged: [{ boardId: 'b', itemId: 'i', stagedAt: 1 }] }
    const out = migrate(v3, 3)
    expect(out.staged).toHaveLength(1)
    expect(out.added).toEqual([])
  })

  test('v1 data is dropped', () => {
    expect(migrate({ junk: true }, 1)).toEqual(initialState())
  })

  test('items from before the music tables become music items: tracklists become tracks, artist names artists', () => {
    const items = {
      a: { id: 'a', typeId: 'music', name: 'Kid A', image: 'k.jpg', artist: 'Radiohead', year: 2000, source: { provider: 'spotify', kind: 'album', id: 'kida' },
           tracks: [{ id: 't1', name: 'One', number: 1, disc: 1, durationMs: 1 }, { id: 't2', name: 'Two', number: 2, disc: 1, durationMs: 2 }] },
      t: { id: 't', typeId: 'music', name: 'One', image: 'k.jpg', artist: 'Radiohead', year: 2000, albumId: 'a', source: { provider: 'spotify', kind: 'track', id: 't1' } },
      r: { id: 'r', typeId: 'music', name: 'Radiohead', source: { provider: 'spotify', kind: 'artist', id: 'rh' } },
      x: { id: 'x', typeId: 'books', name: 'Dune' },
    }
    const out = migrate({ ...initialState(), items }, 5).items
    expect(out.x).toEqual({ id: 'x', typeId: 'books', name: 'Dune' })
    expect(out.r.music).toEqual({ kind: 'artist', vendor: spotify('rh') })
    expect(out.a.music).toEqual({ kind: 'album', vendor: spotify('kida'), year: 2000, tracklistLoaded: true, artistId: 'r' })
    expect(out.t.music).toEqual({ kind: 'track', vendor: spotify('t1'), albumId: 'a', artistId: 'r', disc: 1, number: 1, durationMs: 1 })
    expect(tracksOf(out, 'a').map(t => t.name)).toEqual(['One', 'Two'])
    expect(tracksOf(out, 'a')[1].music).toMatchObject({ vendor: spotify('t2'), artistId: 'r' })
  })
})

describe('item details', () => {
  test('the catalogue fills in artist, cover and tracklist later, without overwriting what\'s there', () => {
    s().openType('music')
    const album = s().addItem('Kid A', { music: albumMusic('k', { year: 2000 }) }, { stage: true })!
    expect(tracksOf(s().items, album.id)).toEqual([])
    s().setAlbumDetails(album.id, albumDetails({ year: 1999, image: 'k.jpg' }))
    const after = s().items[album.id]
    expect(after).toMatchObject({ image: 'k.jpg', music: { year: 2000, tracklistLoaded: true } })
    const artist = artistOf(s().items, after)!
    expect(artist).toMatchObject({ name: 'Radiohead', music: { vendor: spotify('rh') } })
    const tracks = tracksOf(s().items, album.id)
    expect(tracks.map(t => t.name)).toEqual(['Everything In Its Right Place', 'Kid A'])
    expect(tracks[0]).toMatchObject({ image: 'k.jpg', music: { kind: 'track', vendor: spotify('t1'), albumId: album.id, artistId: artist.id, disc: 1, number: 1, durationMs: 251426 } })
    expect(s().placements).toHaveLength(0) // tracks aren't on the board until added
    s().setAlbumDetails(album.id, albumDetails()) // a second load doesn't add them again
    expect(tracksOf(s().items, album.id)).toHaveLength(2)
    s().setItemDetails('missing', { image: 'x' }) // no-op
  })

  test('rating reads UNRATED while staged, and 0–100 once placed', () => {
    s().openType('music')
    const staged = s().addItem('Kid A', {}, { stage: true })!
    const placed = s().addItem('Radiohead')!
    expect(ratingLabel(s(), staged.id)).toBe('UNRATED')
    expect(ratingLabel(s(), placed.id)).toBe('50')
  })
})

describe('editing and removing staged albums', () => {
  const track = (n: number, disc = 1) => ({ id: `t${disc}-${n}`, name: `Track ${n}`, number: n, disc, durationMs: 1000 })
  const stageAlbum = () => {
    s().openType('music')
    const item = s().addItem('Kid A', { music: albumMusic('kida', { year: 2000 }), artist: { name: 'Radiohead' } }, { stage: true })!
    s().setAlbumDetails(item.id, albumDetails({ tracks: [track(1), track(2), track(3), track(1, 2), track(2, 2)] }))
    return item.id
  }
  const tracklist = (id: string) => tracksOf(s().items, id).map(t => ({ id: t.id, name: t.name }))
  const numbering = (id: string) => tracksOf(s().items, id).map(t => t.music?.kind === 'track' ? `${t.music.disc}.${t.music.number}:${t.music.vendor?.id}` : '')

  test('title, year and track names can be changed; text is tidied', () => {
    const id = stageAlbum()
    const tracks = tracklist(id).map((t, i) => i === 0 ? { ...t, name: '  Everything   In Its Right Place ' } : t)
    expect(s().editItem(id, { name: ' Kid A (2000) ', year: 2001, tracks })).toBe(true)
    expect(s().items[id]).toMatchObject({ name: 'Kid A (2000)', music: { year: 2001 } })
    expect(artistOf(s().items, s().items[id])?.name).toBe('Radiohead')
    expect(tracksOf(s().items, id)[0].name).toBe('Everything In Its Right Place')
  })

  test('deleting tracks renumbers each disc from 1, and deletes their items', () => {
    const id = stageAlbum()
    const deleted = tracksOf(s().items, id)[1]
    s().editItem(id, { tracks: tracklist(id).filter((_, i) => i !== 1 && i !== 3) })
    expect(numbering(id)).toEqual(['1.1:t1-1', '1.2:t1-3', '2.1:t2-2'])
    expect(s().items[deleted.id]).toBeUndefined()
  })

  test('the year can be cleared; blank titles, blank track names and non-whole years are rejected without changes', () => {
    const id = stageAlbum()
    const before = s().items
    expect(s().editItem(id, { name: '   ' })).toBe(false)
    expect(s().editItem(id, { year: 19.5 })).toBe(false)
    expect(s().editItem(id, { tracks: [{ ...tracklist(id)[0], name: ' ' }] })).toBe(false)
    expect(s().items).toBe(before)
    expect(s().editItem(id, { year: null })).toBe(true)
    expect(s().items[id].music).not.toHaveProperty('year')
  })

  test('only albums have a year or a tracklist', () => {
    s().openType('music')
    const typed = s().addItem('Radiohead')!
    expect(s().editItem(typed.id, { year: 2000 })).toBe(false)
    expect(s().editItem(typed.id, { tracks: [] })).toBe(false)
  })

  test('removing takes it out of the tray and drops the album, its tracks and its artist', () => {
    const id = stageAlbum()
    s().removeFromBoard(id)
    expect(s().staged).toHaveLength(0)
    expect(s().items).toEqual({})
  })

  test('removing from one board keeps an item another board still uses', () => {
    const id = stageAlbum()
    const musicBoard = s().activeBoardId!
    s().openType('books')
    useStore.setState({ staged: [...s().staged, { boardId: s().activeBoardId!, itemId: id, stagedAt: 1 }] })
    s().removeFromBoard(id)
    expect(s().items[id]).toBeDefined()
    expect(s().staged).toEqual([expect.objectContaining({ boardId: musicBoard, itemId: id })])
  })

  test('removing a placed item takes it off the axis and drops the item', () => {
    s().openType('music')
    const placed = s().addItem('Radiohead')!
    const other = s().addItem('Björk')!
    s().removeFromBoard(placed.id)
    expect(s().placements.map(p => p.itemId)).toEqual([other.id])
    expect(s().items[placed.id]).toBeUndefined()
    expect(s().items[other.id]).toBeDefined()
  })
})

describe('adding an album\'s tracks to the board', () => {
  const tracks = [1, 2, 3].map(n => ({ id: `t${n}`, name: `Track ${n}`, number: n, disc: 1, durationMs: 1000 }))
  const stage = () => {
    s().openType('music')
    const id = s().addItem('Kid A', { image: 'kida.jpg', music: albumMusic('kida', { year: 2000 }), artist: { name: 'Radiohead' } }, { stage: true })!.id
    s().setAlbumDetails(id, albumDetails({ tracks }))
    return id
  }
  const tracklist = (id: string) => tracksOf(s().items, id).map(t => ({ id: t.id, name: t.name }))
  const placedNames = () => [...s().placements].sort((a, b) => a.placedAt - b.placedAt).map(p => s().items[p.itemId].name)

  test('the album\'s own track items go on the tree, with its cover and artist; the album moves to the added column', () => {
    const albumId = stage()
    expect(s().addAlbumTracks(albumId)).toBe(3)
    const placed = s().placements.map(p => s().items[p.itemId])
    expect(placed.map(i => i.name)).toEqual(['Track 1', 'Track 2', 'Track 3'])
    expect(placed.map(i => i.id)).toEqual(tracksOf(s().items, albumId).map(t => t.id)) // not copies
    expect(placed[0]).toMatchObject({ image: 'kida.jpg', music: { kind: 'track', albumId, vendor: spotify('t1') } })
    expect(artistOf(s().items, placed[0])?.name).toBe('Radiohead')
    expect(s().staged).toHaveLength(0)
    expect(s().added).toEqual([expect.objectContaining({ itemId: albumId })])
    expect(vendorStatusOnActiveBoard(s(), 'album', spotify('kida'))).toBe('placed')
  })

  test('tracks are placed in tracklist order and deleted tracks stay out', () => {
    const albumId = stage()
    s().editItem(albumId, { tracks: tracklist(albumId).filter((_, i) => i !== 1) })
    s().addAlbumTracks(albumId)
    expect(placedNames()).toEqual(['Track 1', 'Track 3'])
  })

  test('renaming a placed track in the tracklist renames it on the tree; deleting it takes it off', () => {
    const albumId = stage()
    s().addAlbumTracks(albumId)
    s().editItem(albumId, { tracks: tracklist(albumId).map((t, i) => i === 0 ? { ...t, name: 'Opener' } : t).filter((_, i) => i !== 2) })
    expect(placedNames()).toEqual(['Opener', 'Track 2'])
  })

  test('tracks already on the board are skipped', () => {
    const albumId = stage()
    expect(s().addItem('Track 2', { music: { kind: 'track', vendor: spotify('t2') } })!.id).toBe(tracksOf(s().items, albumId)[1].id)
    expect(s().addAlbumTracks(albumId)).toBe(2)
    expect(s().placements).toHaveLength(3)
  })

  test('only works for an album staged on this board; removing the album later keeps its tracks, unlinked, and their artist', () => {
    const albumId = stage()
    expect(s().addAlbumTracks('nope')).toBeNull()
    s().addAlbumTracks(albumId)
    expect(s().addAlbumTracks(albumId)).toBeNull() // already added
    const artistId = artistOf(s().items, s().items[albumId])!.id
    s().removeFromBoard(albumId)
    expect(s().added).toHaveLength(0)
    expect(s().items[albumId]).toBeUndefined()
    expect(s().placements).toHaveLength(3)
    const track = s().items[s().placements[0].itemId]
    expect(track.music).not.toHaveProperty('albumId')
    expect(artistOf(s().items, track)?.id).toBe(artistId)
  })

  test('removing an album drops its tracks that aren\'t on any board', () => {
    const albumId = stage()
    s().removeFromBoard(albumId)
    expect(Object.values(s().items)).toEqual([])
  })
})

describe('moving placed items', () => {
  const gap = (a: number, b: number) => { const d = Math.abs(a - b) % (2 * Math.PI); return Math.min(d, 2 * Math.PI - d) * 180 / Math.PI }
  const p = (name: string) => s().placements.find(x => s().items[x.itemId].name === name)!

  test('new placements get a branch; items at the same height point at least 60° apart', () => {
    s().openType('music')
    for (const n of ['A', 'B', 'C']) s().addItem(n)
    const [a, b, c] = ['A', 'B', 'C'].map(p)
    expect(a.length).toBe(BRANCH_LENGTH)
    expect(Math.min(gap(a.angle, b.angle), gap(a.angle, c.angle), gap(b.angle, c.angle))).toBeGreaterThanOrEqual(59.9)
  })

  test('moving one item up or down never moves another', () => {
    s().openType('music')
    for (const n of ['A', 'B', 'C', 'D']) s().addItem(n)
    const before = s().placements.filter(x => s().items[x.itemId].name !== 'B').map(x => ({ ...x }))
    s().movePlacement(p('B').itemId, { position: 0.9 })
    expect(p('B').position).toBe(0.9)
    expect(s().placements.filter(x => s().items[x.itemId].name !== 'B')).toEqual(before)
  })

  test('dropping onto a clashing spot turns only the moved branch, to the nearest free direction', () => {
    s().openType('music')
    s().addItem('A')
    s().movePlacement(p('A').itemId, { position: 0.2 })
    s().addItem('B') // at 0.5, far from A
    const b = p('B'), aBefore = { ...p('A') }
    // force B to point the same way as A, then drop it at A's height
    useStore.setState({ placements: s().placements.map(x => x.itemId === b.itemId ? { ...x, angle: aBefore.angle, ring: aBefore.ring } : x) })
    s().movePlacement(b.itemId, { position: 0.2 })
    expect(p('A')).toEqual(aBefore)
    expect(gap(p('B').angle, aBefore.angle)).toBeGreaterThanOrEqual(59.9)
  })

  test('branch length can be changed, clamped; position is clamped to the trunk', () => {
    s().openType('music')
    s().addItem('A')
    const id = p('A').itemId
    s().movePlacement(id, { length: 2.5 })
    expect(p('A').length).toBe(2.5)
    s().movePlacement(id, { length: 99 }); expect(p('A').length).toBe(MAX_BRANCH_LENGTH)
    s().movePlacement(id, { length: 0 }); expect(p('A').length).toBe(MIN_BRANCH_LENGTH)
    s().movePlacement(id, { position: 1.4 }); expect(p('A').position).toBe(1)
    s().movePlacement(id, { position: -1 }); expect(p('A').position).toBe(0)
  })

  test('a custom length survives a re-branch caused by a move', () => {
    s().openType('music')
    s().addItem('A'); s().addItem('B')
    const a = p('A'), b = p('B')
    s().movePlacement(b.itemId, { length: 3 })
    useStore.setState({ placements: s().placements.map(x => x.itemId === b.itemId ? { ...x, angle: a.angle, ring: a.ring } : x) })
    s().movePlacement(b.itemId, { position: a.position + 0.01 })
    expect(p('B').length).toBe(3)
  })
})

describe('v4 → v5 migration', () => {
  test('placements gain the branches they were being drawn with', () => {
    const old = [0.5, 0.5, 0.52, 0.9].map((position, i) => ({ boardId: 'b', itemId: `i${i}`, position, placedAt: i }))
    const out = migrateState({ ...initialState(), placements: old }, 4)
    const expected = assignBranches(old.map(o => o.position), NEAR_POSITION)
    expect(out.placements.map(p => ({ angle: p.angle, length: p.length, ring: p.ring }))).toEqual(expected)
    expect(out.placements.map(p => p.itemId)).toEqual(['i0', 'i1', 'i2', 'i3'])
  })
})

describe('auto-align on the board', () => {
  test('aligns only the open board, keeps every height, and keeps other boards as they were', () => {
    s().openType('books'); s().addItem('Dune')
    const books = s().placements.map(p => ({ ...p }))
    s().openType('music')
    for (const n of ['A', 'B', 'C']) s().addItem(n)
    s().movePlacement(s().placements.find(p => s().items[p.itemId].name === 'C')!.itemId, { position: 0.8 })
    const heights = s().placements.map(p => p.position)
    s().autoAlignBoard()
    expect(s().placements.map(p => p.position)).toEqual(heights)
    const music = s().placements.filter(p => p.boardId === s().activeBoardId)
    expect(music.every(p => Math.abs(Math.abs(Math.sin(p.angle)) - 1) < 1e-9)).toBe(true) // all on the main plane
    expect(s().placements.filter(p => p.boardId !== s().activeBoardId)).toEqual(books)
  })
})

describe('scoring', () => {
  test('0 at the bottom of the trunk, 100 at the top, linear in between, clamped', () => {
    expect(positionToScore(0)).toBe(0)
    expect(positionToScore(1)).toBe(100)
    expect(positionToScore(0.725)).toBeCloseTo(72.5)
    expect(positionToScore(1.3)).toBe(100)
    expect(positionToScore(-0.2)).toBe(0)
    expect(scoreToPosition(72.5)).toBeCloseTo(0.725)
    expect(scoreToPosition(positionToScore(0.3141))).toBeCloseTo(0.3141)
  })

  test('shown as whole numbers', () => {
    expect(formatScore(72.4)).toBe('72')
    expect(formatScore(72.5)).toBe('73')
    expect(formatScore(100)).toBe('100')
  })

  test('a placed item reads its score; dragging changes it', () => {
    s().openType('music')
    const item = s().addItem('Radiohead')!
    expect(ratingLabel(s(), item.id)).toBe('50')
    s().movePlacement(item.id, { position: 0.873 })
    expect(ratingLabel(s(), item.id)).toBe('87')
  })
})
