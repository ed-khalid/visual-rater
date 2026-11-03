import { serve } from '@hono/node-server'
import postgres from 'postgres'
import { createApp } from './app'
import { migrate } from './migrate'
import { applyChanges, loadState } from './repo'
import { createSpotify } from './spotify'

/** v1's Spotify app id (public). The secret comes from the same env var v1 uses and never leaves the server. */
const clientId = process.env.SPOTIFY_CLIENT_ID ?? '793c68b38b06461d8127f90148edc66a'
const clientSecret = process.env.VISUAL_RATER_SPOTIFY_CLIENT_SECRET
const port = Number(process.env.PORT ?? 3002)

/**
 * The v2 database: V2_DATABASE_URL if set, otherwise visual_rater_v2 on localhost as visual_rater_app with the same
 * password env var v1 uses.
 */
const databaseUrl = process.env.V2_DATABASE_URL ?? (process.env.VISUAL_RATER_DATABASE_PW
  ? `postgres://visual_rater_app:${encodeURIComponent(process.env.VISUAL_RATER_DATABASE_PW)}@localhost:5432/visual_rater_v2`
  : undefined)

if (!clientSecret) console.warn('VISUAL_RATER_SPOTIFY_CLIENT_SECRET is not set: music suggestions are disabled.')

/** Optional: keep everything in this schema instead of public (used to run a throwaway test server). */
const schema = process.env.V2_DATABASE_SCHEMA
if (schema && !/^[a-z_][a-z0-9_]{0,62}$/.test(schema)) throw new Error('V2_DATABASE_SCHEMA must be a plain lowercase identifier')

const sql = databaseUrl ? postgres(databaseUrl, { max: 5, onnotice: () => {}, ...(schema ? { connection: { search_path: schema } } : {}) }) : null
let store = null
if (!sql) console.warn('No database configured (set VISUAL_RATER_DATABASE_PW or V2_DATABASE_URL): saving is disabled.')
else {
  try {
    if (schema) await sql.unsafe(`create schema if not exists ${schema}`)
    const applied = await migrate(sql)
    if (applied.length) console.log(`database migrations applied: ${applied.join(', ')}`)
    store = { load: () => loadState(sql), apply: (c: Parameters<typeof applyChanges>[1]) => applyChanges(sql, c) }
  } catch (e) {
    console.error(`Database unavailable (${(e as Error).message}): saving is disabled.`)
  }
}

const app = createApp({ spotify: clientSecret ? createSpotify({ clientId, clientSecret }) : null, store })

serve({ fetch: app.fetch, port, hostname: '127.0.0.1' }, info => console.log(`api listening on http://127.0.0.1:${info.port}`))
