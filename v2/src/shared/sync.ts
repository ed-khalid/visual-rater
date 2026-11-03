/**
 * What travels between the app and the API server when saving. The app keeps its state as separate
 * placements / staged / added lists; the database keeps one row per item on a board (`BoardItem`), with a status.
 */
import type { Board, Item, ItemType, Persisted, Placement, Staged } from './model'

export type BoardItemStatus = 'staged' | 'added' | 'placed'

/** One item on one board. Placed items also carry their position and branch. */
export type BoardItem = {
  boardId: string
  itemId: string
  status: BoardItemStatus
  /** When it was staged / added / placed (ms since epoch). */
  since: number
  position?: number
  angle?: number
  length?: number
  ring?: number
}

/** A batch of saves: what to create-or-update and what to delete, applied in one transaction. */
export type Changes = {
  upsert: { types: ItemType[], boards: Board[], items: Item[], boardItems: BoardItem[] }
  remove: { types: string[], boards: string[], items: string[], boardItems: { boardId: string, itemId: string }[] }
}

export const emptyChanges = (): Changes => ({
  upsert: { types: [], boards: [], items: [], boardItems: [] },
  remove: { types: [], boards: [], items: [], boardItems: [] },
})

export const isEmpty = (c: Changes) =>
  Object.values(c.upsert).every(l => l.length === 0) && Object.values(c.remove).every(l => l.length === 0)

const boardItemKey = (x: { boardId: string, itemId: string }) => `${x.boardId}|${x.itemId}`

/** The app's three lists as database rows. */
export const toBoardItems = (s: Pick<Persisted, 'placements' | 'staged' | 'added'>): BoardItem[] => [
  ...s.staged.map(x => ({ boardId: x.boardId, itemId: x.itemId, status: 'staged' as const, since: x.stagedAt })),
  ...s.added.map(x => ({ boardId: x.boardId, itemId: x.itemId, status: 'added' as const, since: x.stagedAt })),
  ...s.placements.map(p => ({
    boardId: p.boardId, itemId: p.itemId, status: 'placed' as const, since: p.placedAt,
    position: p.position, angle: p.angle, length: p.length, ring: p.ring,
  })),
]

/** Database rows back into the app's three lists (ordered by `since`, as they were created). */
export const fromBoardItems = (rows: BoardItem[]): Pick<Persisted, 'placements' | 'staged' | 'added'> => {
  const sorted = [...rows].sort((a, b) => a.since - b.since)
  const lane = (status: BoardItemStatus): Staged[] =>
    sorted.filter(r => r.status === status).map(r => ({ boardId: r.boardId, itemId: r.itemId, stagedAt: r.since }))
  return {
    staged: lane('staged'),
    added: lane('added'),
    placements: sorted.filter(r => r.status === 'placed').map((r): Placement => ({
      boardId: r.boardId, itemId: r.itemId, placedAt: r.since,
      position: r.position ?? 0.5, angle: r.angle ?? 0, length: r.length ?? 1.25, ring: r.ring ?? 0,
    })),
  }
}

const sameBoardItem = (a: BoardItem, b: BoardItem) =>
  a.status === b.status && a.since === b.since && a.position === b.position && a.angle === b.angle && a.length === b.length && a.ring === b.ring

/**
 * What changed between two saved states. The store only ever replaces objects it changes, so a different object
 * reference means "changed"; board items are compared by value, since they're rebuilt from three lists.
 */
export const diffState = (prev: Persisted, next: Persisted): Changes => {
  const c = emptyChanges()
  const records = <T,>(a: Record<string, T>, b: Record<string, T>, up: T[], rm: string[]) => {
    for (const [id, v] of Object.entries(b)) if (a[id] !== v) up.push(v)
    for (const id of Object.keys(a)) if (!(id in b)) rm.push(id)
  }
  records(prev.types, next.types, c.upsert.types, c.remove.types)
  records(prev.boards, next.boards, c.upsert.boards, c.remove.boards)
  records(prev.items, next.items, c.upsert.items, c.remove.items)

  if (prev.placements !== next.placements || prev.staged !== next.staged || prev.added !== next.added) {
    const before = new Map(toBoardItems(prev).map(x => [boardItemKey(x), x]))
    const after = new Map(toBoardItems(next).map(x => [boardItemKey(x), x]))
    for (const [k, v] of after) { const old = before.get(k); if (!old || !sameBoardItem(old, v)) c.upsert.boardItems.push(v) }
    for (const [k, v] of before) if (!after.has(k)) c.remove.boardItems.push({ boardId: v.boardId, itemId: v.itemId })
  }
  return c
}

/**
 * Folds a newer batch into an older unsent one, so a retry sends the latest version of everything once:
 * a later upsert replaces an earlier one or cancels an earlier delete, and a later delete cancels an earlier upsert.
 */
export const mergeChanges = (older: Changes, newer: Changes): Changes => {
  const out = emptyChanges()
  const byId = <T extends { id: string }>(o: T[], oRm: string[], n: T[], nRm: string[], up: T[], rm: string[]) => {
    const ups = new Map(o.map(x => [x.id, x])), rms = new Set(oRm)
    for (const x of n) { ups.set(x.id, x); rms.delete(x.id) }
    for (const id of nRm) { ups.delete(id); rms.add(id) }
    up.push(...ups.values()); rm.push(...rms)
  }
  byId(older.upsert.types, older.remove.types, newer.upsert.types, newer.remove.types, out.upsert.types, out.remove.types)
  byId(older.upsert.boards, older.remove.boards, newer.upsert.boards, newer.remove.boards, out.upsert.boards, out.remove.boards)
  byId(older.upsert.items, older.remove.items, newer.upsert.items, newer.remove.items, out.upsert.items, out.remove.items)
  const ups = new Map(older.upsert.boardItems.map(x => [boardItemKey(x), x]))
  const rms = new Map(older.remove.boardItems.map(x => [boardItemKey(x), x]))
  for (const x of newer.upsert.boardItems) { ups.set(boardItemKey(x), x); rms.delete(boardItemKey(x)) }
  for (const x of newer.remove.boardItems) { ups.delete(boardItemKey(x)); rms.set(boardItemKey(x), x) }
  out.upsert.boardItems.push(...ups.values()); out.remove.boardItems.push(...rms.values())
  return out
}

/** Everything in a state, as one batch of upserts (used to import data that only exists in the browser). */
export const everything = (s: Persisted): Changes => diffState({ types: {}, items: {}, boards: {}, placements: [], staged: [], added: [] }, s)
