import { serve } from '@hono/node-server'
import { createApp } from './app'
import { createSpotify } from './spotify'

/** v1's Spotify app id (public). The secret comes from the same env var v1 uses and never leaves the server. */
const clientId = process.env.SPOTIFY_CLIENT_ID ?? '793c68b38b06461d8127f90148edc66a'
const clientSecret = process.env.VISUAL_RATER_SPOTIFY_CLIENT_SECRET
const port = Number(process.env.PORT ?? 3002)

if (!clientSecret) console.warn('VISUAL_RATER_SPOTIFY_CLIENT_SECRET is not set: music suggestions are disabled.')

const app = createApp({ spotify: clientSecret ? createSpotify({ clientId, clientSecret }) : null })

serve({ fetch: app.fetch, port, hostname: '127.0.0.1' }, info => console.log(`api listening on http://127.0.0.1:${info.port}`))
