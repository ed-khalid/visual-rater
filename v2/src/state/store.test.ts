import { beforeEach, describe, expect, test } from 'vitest'
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

  test('v2 data keeps everything and gains an empty tray', () => {
    const { staged: _, ...v2 } = { ...initialState(), placements: [{ boardId: 'b', itemId: 'i', position: 0.5, placedAt: 1 }] }
    const out = migrate(v2, 2)
    expect(out.placements).toHaveLength(1)
    expect(out.staged).toEqual([])
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
    s().removeStaged(id)
    expect(s().staged).toHaveLength(0)
    expect(s().items[id]).toBeUndefined()
  })

  test('removing from one board keeps an item another board still uses', () => {
    const id = stageAlbum()
    const musicBoard = s().activeBoardId!
    s().openType('books')
    useStore.setState({ staged: [...s().staged, { boardId: s().activeBoardId!, itemId: id, stagedAt: 1 }] })
    s().removeStaged(id)
    expect(s().items[id]).toBeDefined()
    expect(s().staged).toEqual([expect.objectContaining({ boardId: musicBoard, itemId: id })])
  })
})
