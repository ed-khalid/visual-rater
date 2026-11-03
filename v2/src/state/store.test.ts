import { beforeEach, describe, expect, test } from 'vitest'
import { initialState, useStore } from './store'

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
})
