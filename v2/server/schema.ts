import { z } from 'zod'

/** Validation for POST /api/sync bodies: everything the server writes to the database goes through this first. */

const uuid = z.uuid()
const text = (max = 500) => z.string().min(1).max(max)
const count = z.number().int().min(0)
const vendor = z.object({ name: z.literal('spotify'), id: text(64) }).optional()

const base = {
  id: uuid,
  name: text(),
  // http(s) only: a plain url check also accepts javascript:, data:, ftp: and so on
  image: z.url({ protocol: /^https?$/ }).max(2000).optional(),
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
})
const track = z.object({
  ...base, ...rateable, vendor,
  albumId: uuid.optional(),
  artistId: uuid.optional(),
  disc: count.optional(),
  number: count.optional(),
  durationMs: count.optional(),
  excludeFromArtistScore: z.boolean().optional(),
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
