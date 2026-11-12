import { z } from 'zod'
import { SHORT_TITLE_MAX } from '../src/shared/names'

/** Validation for POST /api/sync bodies: everything the server writes to the database goes through this first. */

const uuid = z.uuid()
const text = (max = 500) => z.string().min(1).max(max)
const count = z.number().int().min(0)
const vendor = z.object({ name: z.literal('spotify'), id: text(64) }).optional()

/** An uploaded picture: a JPEG, PNG or WebP as a base64 data: URL, at most about 300 KB. */
export const MAX_UPLOAD = 400_000
const uploaded = z.string().max(MAX_UPLOAD).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/)

const base = {
  id: uuid,
  name: text(),
  // http(s) only (a plain url check also accepts javascript:, data:, ftp: and so on), or a picture uploaded in the
  // ADD palette's form, kept as a base64 data: URL (hud/thumbnail.ts makes it small)
  image: z.union([z.url({ protocol: /^https?$/ }).max(2000), uploaded]).optional(),
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(16).optional(),
}

const rateable = {
  score: z.number().min(0).max(100).optional(),
  branch: z.object({ angle: z.number().finite(), length: z.number().positive().max(100), ring: count }).optional(),
  since: count.optional(),
  hidden: z.boolean().optional(),
}

const artist = z.object({ ...base, vendor })
const album = z.object({
  ...base, vendor,
  artistId: uuid.optional(),
  year: z.number().int().min(0).max(9999).optional(),
  tracklistLoaded: z.boolean(),
  stagedAt: count,
  addedAt: count.optional(),
  misc: z.literal(true).optional(),
})
const track = z.object({
  ...base, ...rateable, vendor,
  albumId: uuid.optional(),
  artistId: uuid.optional(),
  disc: count.optional(),
  number: count.optional(),
  durationMs: count.optional(),
  notASong: z.boolean().optional(),
  live: z.boolean().optional(),
  shortTitle: z.string().trim().min(1).max(SHORT_TITLE_MAX).optional(),
})
const simple = z.object({ ...base, ...rateable })

/** At most this many records of each kind per batch. */
const MAX = 5000
const ids = z.array(uuid).max(MAX)

export const changesSchema = z.object({
  upsert: z.object({
    artists: z.array(artist).max(MAX),
    albums: z.array(album).max(MAX),
    tracks: z.array(track).max(MAX),
    movies: z.array(simple).max(MAX),
    books: z.array(simple).max(MAX),
  }),
  remove: z.object({ artists: ids, albums: ids, tracks: ids, movies: ids, books: ids }),
})
