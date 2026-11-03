import { beforeEach, describe, expect, test } from 'vitest'
import { assignBranches, BRANCH_LENGTH, MAX_BRANCH_LENGTH, MIN_BRANCH_LENGTH, NEAR_POSITION } from './layout'
import { initialState, migrateState, ratingLabel, sourceStatusOnActiveBoard, useStore } from './store'

const s = () => useStore.getState()

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

  test('catalogue picks keep their image and source, and are matched by catalogue id, not name', () => {
    s().openType('music')
    const src = { provider: 'spotify' as const, kind: 'artist' as const, id: 'abc' }
    expect(s().addItem('Nirvana', { image: 'img.jpg', source: src })).toMatchObject({ name: 'Nirvana', image: 'img.jpg', source: src })
    expect(s().addItem('Nirvana (again)', { source: src })).toBeNull()
    // a different band with the same name is a different artist
    expect(s().addItem('Nirvana', { source: { provider: 'spotify', kind: 'artist', id: 'other' } })).not.toBeNull()
  })

  test('staging: goes to the tray, not the axis, and still counts as on the board', () => {
    s().openType('music')
    const src = { provider: 'spotify' as const, kind: 'album' as const, id: 'okc' }
    const item = s().addItem('OK Computer', { image: 'okc.jpg', source: src }, { stage: true })!
    expect(s().placements).toHaveLength(0)
    expect(s().staged).toEqual([expect.objectContaining({ boardId: s().activeBoardId, itemId: item.id })])
    expect(sourceStatusOnActiveBoard(s(), src)).toBe('staged')
    expect(s().addItem('OK Computer', { source: src }, { stage: true })).toBeNull()
    expect(s().addItem('ok computer')).toBeNull() // typed duplicate of a staged name
  })

  test('staged items belong to their board', () => {
    s().openType('music')
    s().addItem('Kid A', {}, { stage: true })
    s().openType('books')
    expect(s().addItem('Kid A')).not.toBeNull()
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
})

describe('item details', () => {
  test('an album keeps artist and year, and its tracklist can be filled in later', () => {
    s().openType('music')
    const album = s().addItem('Kid A', { artist: 'Radiohead', year: 2000, source: { provider: 'spotify', kind: 'album', id: 'k' } }, { stage: true })!
    expect(s().items[album.id]).toMatchObject({ artist: 'Radiohead', year: 2000 })
    expect(s().items[album.id].tracks).toBeUndefined()
    const tracks = [{ id: 't1', name: 'Everything In Its Right Place', number: 1, disc: 1, durationMs: 251426 }]
    s().setItemDetails(album.id, { tracks, year: undefined })
    expect(s().items[album.id]).toMatchObject({ tracks, year: 2000 }) // undefined doesn't wipe the year
    s().setItemDetails('missing', { year: 1 }) // no-op
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
    const item = s().addItem('Kid A', { artist: 'Radiohead', year: 2000, tracks: [track(1), track(2), track(3), track(1, 2), track(2, 2)] }, { stage: true })!
    return item.id
  }

  test('title, year and track names can be changed; text is tidied', () => {
    const id = stageAlbum()
    const tracks = s().items[id].tracks!.map((t, i) => i === 0 ? { ...t, name: '  Everything   In Its Right Place ' } : t)
    expect(s().editItem(id, { name: ' Kid A (2000) ', year: 2001, tracks })).toBe(true)
    expect(s().items[id]).toMatchObject({ name: 'Kid A (2000)', year: 2001, artist: 'Radiohead' })
    expect(s().items[id].tracks![0].name).toBe('Everything In Its Right Place')
  })

  test('deleting tracks renumbers each disc from 1', () => {
    const id = stageAlbum()
    const kept = s().items[id].tracks!.filter(t => !(t.disc === 1 && t.number === 2) && !(t.disc === 2 && t.number === 1))
    s().editItem(id, { tracks: kept })
    expect(s().items[id].tracks!.map(t => `${t.disc}.${t.number}:${t.id}`)).toEqual(['1.1:t1-1', '1.2:t1-3', '2.1:t2-2'])
  })

  test('the year can be cleared; blank titles, blank track names and non-whole years are rejected without changes', () => {
    const id = stageAlbum()
    const before = s().items[id]
    expect(s().editItem(id, { name: '   ' })).toBe(false)
    expect(s().editItem(id, { year: 19.5 })).toBe(false)
    expect(s().editItem(id, { tracks: [{ ...track(1), name: ' ' }] })).toBe(false)
    expect(s().items[id]).toBe(before)
    expect(s().editItem(id, { year: null })).toBe(true)
    expect(s().items[id].year).toBeUndefined()
  })

  test('removing takes it out of the tray and drops the item', () => {
    const id = stageAlbum()
    s().removeFromBoard(id)
    expect(s().staged).toHaveLength(0)
    expect(s().items[id]).toBeUndefined()
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
    return s().addItem('Kid A', { image: 'kida.jpg', artist: 'Radiohead', year: 2000, tracks, source: { provider: 'spotify', kind: 'album', id: 'kida' } }, { stage: true })!.id
  }

  test('each track becomes an item on the tree with the album\'s cover, artist and year; the album moves to the added column', () => {
    const albumId = stage()
    expect(s().addAlbumTracks(albumId)).toBe(3)
    const placed = s().placements.map(p => s().items[p.itemId])
    expect(placed.map(i => i.name)).toEqual(['Track 1', 'Track 2', 'Track 3'])
    expect(placed[0]).toMatchObject({ image: 'kida.jpg', artist: 'Radiohead', year: 2000, albumId, source: { provider: 'spotify', kind: 'track', id: 't1' } })
    expect(s().staged).toHaveLength(0)
    expect(s().added).toEqual([expect.objectContaining({ itemId: albumId })])
    expect(sourceStatusOnActiveBoard(s(), { provider: 'spotify', kind: 'album', id: 'kida' })).toBe('placed')
  })

  test('tracks are placed in tracklist order and deleted tracks stay out', () => {
    const albumId = stage()
    s().editItem(albumId, { tracks: [tracks[0], tracks[2]] })
    s().addAlbumTracks(albumId)
    const ordered = [...s().placements].sort((a, b) => a.placedAt - b.placedAt).map(p => s().items[p.itemId].name)
    expect(ordered).toEqual(['Track 1', 'Track 3'])
  })

  test('tracks already on the board are skipped', () => {
    const albumId = stage()
    s().addItem('Track 2', { source: { provider: 'spotify', kind: 'track', id: 't2' } })
    expect(s().addAlbumTracks(albumId)).toBe(2)
    expect(s().placements).toHaveLength(3)
  })

  test('only works for an album staged on this board; removing the album later keeps its tracks', () => {
    const albumId = stage()
    expect(s().addAlbumTracks('nope')).toBeNull()
    s().addAlbumTracks(albumId)
    expect(s().addAlbumTracks(albumId)).toBeNull() // already added
    s().removeFromBoard(albumId)
    expect(s().added).toHaveLength(0)
    expect(s().items[albumId]).toBeUndefined()
    expect(s().placements).toHaveLength(3)
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
