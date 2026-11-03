import { z } from 'zod'

/** Validation for POST /api/sync bodies: everything the server writes to the database goes through this first. */

const uuid = z.uuid()
const text = (max = 500) => z.string().min(1).max(max)

const itemType = z.object({ id: text(64), name: text(64), builtIn: z.boolean() })

const board = z.object({
  id: uuid,
  typeId: text(64),
  name: text(64),
  axis: z.literal('linear'),
  bands: z.array(z.object({ name: text(64), from: z.number().min(0).max(1), to: z.number().min(0).max(1) })).max(50),
})

const vendor = z.object({ name: z.literal('spotify'), id: text(64) }).optional()
const count = z.number().int().min(0)

const music = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('artist'), vendor }),
  z.object({ kind: z.literal('album'), vendor, artistId: uuid.optional(), year: z.number().int().min(0).max(9999).optional(), tracklistLoaded: z.boolean() }),
  z.object({
    kind: z.literal('track'), vendor, albumId: uuid.optional(), artistId: uuid.optional(),
    disc: count.optional(), number: count.optional(), durationMs: count.optional(),
  }),
])

const item = z.object({
  id: uuid,
  typeId: text(64),
  name: text(),
  // http(s) only: a plain url check also accepts javascript:, data:, ftp: and so on
  image: z.url({ protocol: /^https?$/ }).max(2000).optional(),
  colors: z.array(z.string().max(32)).max(16).optional(),
  music: music.optional(),
})

const boardItem = z.object({
  boardId: uuid,
  itemId: uuid,
  status: z.enum(['staged', 'added', 'placed']),
  since: z.number().int().min(0),
  position: z.number().min(0).max(1).optional(),
  angle: z.number().finite().optional(),
  length: z.number().positive().max(100).optional(),
  ring: z.number().int().min(0).optional(),
}).refine(x => x.status !== 'placed' || (x.position !== undefined && x.angle !== undefined && x.length !== undefined && x.ring !== undefined),
  { message: 'placed items need position, angle, length and ring' })

const key = z.object({ boardId: uuid, itemId: uuid })

/** At most this many entities of each kind per batch (an import of a big board fits comfortably). */
const MAX = 5000

export const changesSchema = z.object({
  upsert: z.object({
    types: z.array(itemType).max(MAX),
    boards: z.array(board).max(MAX),
    items: z.array(item).max(MAX),
    boardItems: z.array(boardItem).max(MAX),
  }),
  remove: z.object({
    types: z.array(text(64)).max(MAX),
    boards: z.array(uuid).max(MAX),
    items: z.array(uuid).max(MAX),
    boardItems: z.array(key).max(MAX),
  }),
})
