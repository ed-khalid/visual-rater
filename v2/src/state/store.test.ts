import { beforeEach, describe, expect, test } from 'vitest'
import { initialState, migrateState, sourceStatusOnActiveBoard, useStore } from './store'

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
