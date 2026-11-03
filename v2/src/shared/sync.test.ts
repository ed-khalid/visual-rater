import { describe, expect, test } from 'vitest'
import type { Persisted } from './model'
import { diffState, everything, fromBoardItems, isEmpty, mergeChanges, toBoardItems } from './sync'

const base = (): Persisted => ({
  types: { music: { id: 'music', name: 'MUSIC', builtIn: true } },
  boards: { b: { id: 'b', typeId: 'music', name: 'MUSIC', axis: 'linear', bands: [] } },
  items: { a: { id: 'a', typeId: 'music', name: 'Kid A' }, r: { id: 'r', typeId: 'music', name: 'Radiohead' } },
  staged: [{ boardId: 'b', itemId: 'a', stagedAt: 1 }],
  added: [],
  placements: [{ boardId: 'b', itemId: 'r', position: 0.5, placedAt: 2, angle: 0, length: 1.25, ring: 0 }],
})

describe('board items', () => {
  test('round-trip between the app\'s lists and database rows', () => {
    const s = base()
    expect(fromBoardItems(toBoardItems(s))).toEqual({ staged: s.staged, added: s.added, placements: s.placements })
  })
})

describe('diffState', () => {
  test('no change, nothing to send', () => {
    const s = base()
    expect(isEmpty(diffState(s, { ...s }))).toBe(true)
  })

  test('a changed item is upserted; a removed one is deleted', () => {
    const s = base()
    const next = { ...s, items: { ...s.items, a: { ...s.items.a, name: 'Kid A (Remaster)' } } }
    delete (next.items as Record<string, unknown>).r
    const c = diffState(s, next)
    expect(c.upsert.items.map(i => i.name)).toEqual(['Kid A (Remaster)'])
    expect(c.remove.items).toEqual(['r'])
  })

  test('moving a placement upserts just that board item; moving an album between lists changes its status', () => {
    const s = base()
    const moved = { ...s, placements: [{ ...s.placements[0], position: 0.8 }] }
    expect(diffState(s, moved).upsert.boardItems).toEqual([expect.objectContaining({ itemId: 'r', status: 'placed', position: 0.8 })])
    const added = { ...s, staged: [], added: [{ boardId: 'b', itemId: 'a', stagedAt: 3 }] }
    const c = diffState(s, added)
    expect(c.upsert.boardItems).toEqual([expect.objectContaining({ itemId: 'a', status: 'added', since: 3 })])
    expect(c.remove.boardItems).toEqual([])
  })

  test('taking an item off a board deletes its board item', () => {
    const s = base()
    expect(diffState(s, { ...s, staged: [] }).remove.boardItems).toEqual([{ boardId: 'b', itemId: 'a' }])
  })

  test('everything() is a full upsert of a state', () => {
    const c = everything(base())
    expect(c.upsert.items).toHaveLength(2)
    expect(c.upsert.boardItems).toHaveLength(2)
    expect(c.remove.items).toEqual([])
  })
})

describe('mergeChanges', () => {
  test('a later upsert wins; a later delete cancels an earlier upsert and vice versa', () => {
    const s = base()
    const first = diffState(s, { ...s, items: { ...s.items, a: { ...s.items.a, name: 'v1' } } })
    const second = diffState(s, { ...s, items: { ...s.items, a: { ...s.items.a, name: 'v2' } } })
    expect(mergeChanges(first, second).upsert.items.map(i => i.name)).toEqual(['v2'])
    const del = { ...first, upsert: { ...first.upsert, items: [] }, remove: { ...first.remove, items: ['a'] } }
    const merged = mergeChanges(first, del)
    expect(merged.upsert.items).toEqual([])
    expect(merged.remove.items).toEqual(['a'])
    expect(mergeChanges(del, second).remove.items).toEqual([])
  })
})
