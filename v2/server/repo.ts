import type { Sql } from 'postgres'
import type { Board, Item, ItemType, Persisted } from '../src/shared/model'
import type { Track } from '../src/shared/suggestions'
import { type BoardItem, type Changes, fromBoardItems } from '../src/shared/sync'

type ItemRow = {
  id: string, type_id: string, name: string, image: string | null, colors: string[] | null,
  source_provider: string | null, source_kind: string | null, source_id: string | null,
  artist: string | null, year: number | null, album_id: string | null, tracks: Track[] | null,
}

const itemFromRow = (r: ItemRow): Item => {
  const item: Item = { id: r.id, typeId: r.type_id, name: r.name }
  if (r.image !== null) item.image = r.image
  if (r.colors !== null) item.colors = r.colors
  if (r.source_provider && r.source_kind && r.source_id) item.source = { provider: r.source_provider as 'spotify', kind: r.source_kind as 'artist' | 'album' | 'track', id: r.source_id }
  if (r.artist !== null) item.artist = r.artist
  if (r.year !== null) item.year = r.year
  if (r.album_id !== null) item.albumId = r.album_id
  if (r.tracks !== null) item.tracks = r.tracks
  return item
}

/** Everything saved, in the shape the app keeps it. */
export const loadState = async (sql: Sql): Promise<Persisted> => {
  const [types, boards, items, rows] = await Promise.all([
    sql<{ id: string, name: string, built_in: boolean }[]>`select id, name, built_in from item_types`,
    sql<{ id: string, type_id: string, name: string, axis: 'linear', bands: Board['bands'] }[]>`select id, type_id, name, axis, bands from boards`,
    sql<ItemRow[]>`select * from items`,
    sql<{ board_id: string, item_id: string, status: BoardItem['status'], since: number, position: number | null, angle: number | null, length: number | null, ring: number | null }[]>`
      select board_id, item_id, status, since::double precision as since, position, angle, length, ring from board_items`,
  ])
  const boardItems: BoardItem[] = rows.map(r => ({
    boardId: r.board_id, itemId: r.item_id, status: r.status, since: r.since,
    ...(r.position !== null ? { position: r.position } : {}),
    ...(r.angle !== null ? { angle: r.angle } : {}),
    ...(r.length !== null ? { length: r.length } : {}),
    ...(r.ring !== null ? { ring: r.ring } : {}),
  }))
  return {
    types: Object.fromEntries(types.map((t): [string, ItemType] => [t.id, { id: t.id, name: t.name, builtIn: t.built_in }])),
    boards: Object.fromEntries(boards.map((b): [string, Board] => [b.id, { id: b.id, typeId: b.type_id, name: b.name, axis: b.axis, bands: b.bands }])),
    items: Object.fromEntries(items.map(r => [r.id, itemFromRow(r)])),
    ...fromBoardItems(boardItems),
  }
}

/**
 * Applies a batch of saves in one transaction: upserts in dependency order (types, boards, items, board items),
 * then deletes in reverse order. Foreign keys from items to albums and from board items to items are checked at
 * commit, so a batch can create an album and its tracks, or an item and its board row, together.
 */
export const applyChanges = async (sql: Sql, c: Changes): Promise<void> => {
  await sql.begin(async tx => {
    for (const t of c.upsert.types) {
      await tx`insert into item_types (id, name, built_in) values (${t.id}, ${t.name}, ${t.builtIn})
        on conflict (id) do update set name = excluded.name, built_in = excluded.built_in`
    }
    for (const b of c.upsert.boards) {
      await tx`insert into boards (id, type_id, name, axis, bands) values (${b.id}, ${b.typeId}, ${b.name}, ${b.axis}, ${tx.json(b.bands)})
        on conflict (id) do update set type_id = excluded.type_id, name = excluded.name, axis = excluded.axis, bands = excluded.bands`
    }
    for (const i of c.upsert.items) {
      await tx`insert into items (id, type_id, name, image, colors, source_provider, source_kind, source_id, artist, year, album_id, tracks)
        values (${i.id}, ${i.typeId}, ${i.name}, ${i.image ?? null}, ${i.colors ?? null},
                ${i.source?.provider ?? null}, ${i.source?.kind ?? null}, ${i.source?.id ?? null},
                ${i.artist ?? null}, ${i.year ?? null}, ${i.albumId ?? null}, ${i.tracks ? tx.json(i.tracks) : null})
        on conflict (id) do update set type_id = excluded.type_id, name = excluded.name, image = excluded.image, colors = excluded.colors,
          source_provider = excluded.source_provider, source_kind = excluded.source_kind, source_id = excluded.source_id,
          artist = excluded.artist, year = excluded.year, album_id = excluded.album_id, tracks = excluded.tracks`
    }
    for (const x of c.upsert.boardItems) {
      await tx`insert into board_items (board_id, item_id, status, since, position, angle, length, ring)
        values (${x.boardId}, ${x.itemId}, ${x.status}, ${x.since}, ${x.position ?? null}, ${x.angle ?? null}, ${x.length ?? null}, ${x.ring ?? null})
        on conflict (board_id, item_id) do update set status = excluded.status, since = excluded.since,
          position = excluded.position, angle = excluded.angle, length = excluded.length, ring = excluded.ring`
    }
    for (const x of c.remove.boardItems) await tx`delete from board_items where board_id = ${x.boardId} and item_id = ${x.itemId}`
    if (c.remove.items.length) await tx`delete from items where id in ${tx(c.remove.items)}`
    if (c.remove.boards.length) await tx`delete from boards where id in ${tx(c.remove.boards)}`
    if (c.remove.types.length) await tx`delete from item_types where id in ${tx(c.remove.types)} and not built_in`
  })
}
