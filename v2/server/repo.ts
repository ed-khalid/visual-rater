import type { Sql, TransactionSql } from 'postgres'
import type { Board, Item, ItemType, MusicDetails, Persisted, VendorRef } from '../src/shared/model'
import { type BoardItem, type Changes, fromBoardItems } from '../src/shared/sync'

type ItemRow = { id: string, type_id: string, name: string, image: string | null, colors: string[] | null }
type VendorCols = { item_id: string, vendor: string | null, vendor_id: string | null }
type ArtistRow = VendorCols
type AlbumRow = VendorCols & { artist_id: string | null, year: number | null, tracklist_loaded: boolean }
type TrackRow = VendorCols & { album_id: string | null, artist_id: string | null, disc: number | null, number: number | null, duration_ms: number | null }

/** Copies the non-null columns onto `out` under their app names. */
const defined = <T extends object>(out: T, fields: Record<string, unknown>): T => {
  for (const [k, v] of Object.entries(fields)) if (v !== null && v !== undefined) (out as Record<string, unknown>)[k] = v
  return out
}

const vendorOf = (r: VendorCols): VendorRef | undefined =>
  r.vendor && r.vendor_id ? { name: r.vendor as VendorRef['name'], id: r.vendor_id } : undefined

const itemFromRow = (r: ItemRow, music: MusicDetails | undefined): Item =>
  defined({ id: r.id, typeId: r.type_id, name: r.name } as Item, { image: r.image, colors: r.colors, music })

/** Everything saved, in the shape the app keeps it. */
export const loadState = async (sql: Sql): Promise<Persisted> => {
  const [types, boards, items, artists, albums, tracks, rows] = await Promise.all([
    sql<{ id: string, name: string, built_in: boolean }[]>`select id, name, built_in from item_types`,
    sql<{ id: string, type_id: string, name: string, axis: 'linear', bands: Board['bands'] }[]>`select id, type_id, name, axis, bands from boards`,
    sql<ItemRow[]>`select id, type_id, name, image, colors from items`,
    sql<ArtistRow[]>`select item_id, vendor, vendor_id from music_artists`,
    sql<AlbumRow[]>`select item_id, vendor, vendor_id, artist_id, year, tracklist_loaded from music_albums`,
    sql<TrackRow[]>`select item_id, vendor, vendor_id, album_id, artist_id, disc, number, duration_ms from music_tracks`,
    sql<{ board_id: string, item_id: string, status: BoardItem['status'], since: number, position: number | null, angle: number | null, length: number | null, ring: number | null }[]>`
      select board_id, item_id, status, since::double precision as since, position, angle, length, ring from board_items`,
  ])
  const music = new Map<string, MusicDetails>()
  for (const r of artists) music.set(r.item_id, defined({ kind: 'artist' } as MusicDetails, { vendor: vendorOf(r) }))
  for (const r of albums) {
    music.set(r.item_id, defined({ kind: 'album', tracklistLoaded: r.tracklist_loaded } as MusicDetails, { vendor: vendorOf(r), artistId: r.artist_id, year: r.year }))
  }
  for (const r of tracks) {
    music.set(r.item_id, defined({ kind: 'track' } as MusicDetails, {
      vendor: vendorOf(r), albumId: r.album_id, artistId: r.artist_id, disc: r.disc, number: r.number, durationMs: r.duration_ms,
    }))
  }
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
    items: Object.fromEntries(items.map(r => [r.id, itemFromRow(r, music.get(r.id))])),
    ...fromBoardItems(boardItems),
  }
}

/** Writes an item's music row, in the table for its kind. */
const upsertMusic = async (tx: TransactionSql, itemId: string, m: MusicDetails) => {
  const vendor = m.vendor?.name ?? null, vendorId = m.vendor?.id ?? null
  if (m.kind === 'artist') {
    await tx`insert into music_artists (item_id, vendor, vendor_id) values (${itemId}, ${vendor}, ${vendorId})
      on conflict (item_id) do update set vendor = excluded.vendor, vendor_id = excluded.vendor_id`
  } else if (m.kind === 'album') {
    await tx`insert into music_albums (item_id, vendor, vendor_id, artist_id, year, tracklist_loaded)
      values (${itemId}, ${vendor}, ${vendorId}, ${m.artistId ?? null}, ${m.year ?? null}, ${m.tracklistLoaded})
      on conflict (item_id) do update set vendor = excluded.vendor, vendor_id = excluded.vendor_id, artist_id = excluded.artist_id,
        year = excluded.year, tracklist_loaded = excluded.tracklist_loaded`
  } else {
    await tx`insert into music_tracks (item_id, vendor, vendor_id, album_id, artist_id, disc, number, duration_ms)
      values (${itemId}, ${vendor}, ${vendorId}, ${m.albumId ?? null}, ${m.artistId ?? null}, ${m.disc ?? null}, ${m.number ?? null}, ${m.durationMs ?? null})
      on conflict (item_id) do update set vendor = excluded.vendor, vendor_id = excluded.vendor_id, album_id = excluded.album_id,
        artist_id = excluded.artist_id, disc = excluded.disc, number = excluded.number, duration_ms = excluded.duration_ms`
  }
}

/**
 * Applies a batch of saves in one transaction: upserts in dependency order (types, boards, items with their music
 * rows, board items), then deletes in reverse order. Links between music rows (track → album, album → artist) and
 * from board items to items are checked at commit, so a batch can create an album, its artist and its tracks, or an
 * item and its board row, together, in any order.
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
      await tx`insert into items (id, type_id, name, image, colors)
        values (${i.id}, ${i.typeId}, ${i.name}, ${i.image ?? null}, ${i.colors ?? null})
        on conflict (id) do update set type_id = excluded.type_id, name = excluded.name, image = excluded.image, colors = excluded.colors`
    }
    // After all the items, so a music row can refer to an item later in the batch.
    for (const i of c.upsert.items) if (i.music) await upsertMusic(tx, i.id, i.music)
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
