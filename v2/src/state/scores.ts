/**
 * Album and artist scores, worked out from their tracks' scores: the album the v1 average, the artist points by song
 * tier. The same formulas back the music_album_scores and music_artist_scores views in the database (server/db/001,
 * 005), so the app and SQL agree.
 *
 * Only rated tracks count; a hidden track still counts (hiding keeps its score); a track that's not a song
 * (Track.notASong: a skit…) never counts, rated or not.
 */
import type { Track } from '../shared/model'
import { roundToShown, TRACK_TIERS } from '../shared/scale'
import { tierOf } from '../shared/tiers'

/** Album: the average score of its rated tracks. Undefined if none are rated. */
export const albumScore = (tracks: Pick<Track, 'score' | 'notASong'>[]): number | undefined => {
  const rated = tracks.filter(t => t.score !== undefined && !t.notASong)
  return rated.length ? rated.reduce((sum, t) => sum + t.score!, 0) / rated.length : undefined
}

/**
 * Whether an album still has songs to rate: any of its songs on the rater (hidden ones aside) without a score. Such an
 * album has no score or grade yet; it shows Incomplete instead (board.rating).
 */
export const isIncomplete = (tracks: Pick<Track, 'score' | 'hidden' | 'notASong'>[]): boolean => tracks.some(t => t.score === undefined && !t.hidden && !t.notASong)

/** An album's score as shown: none while it's incomplete. (Artist scores still count every rated song.) */
export const shownAlbumScore = (tracks: Pick<Track, 'score' | 'hidden' | 'notASong'>[]): number | undefined =>
  isIncomplete(tracks) ? undefined : albumScore(tracks)

/**
 * Artist: a count of points for their rated tracks, each adding its song tier's points (shared/scale.ts: CLASSIC 6,
 * GREAT 4, GOOD 1, PLEASANT 0.5, INTERESTING 0.1, the rest nothing), by its score as shown, so a song adds what its tier
 * says. It grows with how many great songs they have and has no upper limit. Tracks marked notASong
 * don't count. Live recordings of songs they already have (Track.live) don't count either. The music_artist_scores view (server/db/005–007) does the same.
 */
export const artistWeight = (score: number) => tierOf(TRACK_TIERS, roundToShown(score))?.points ?? 0

/** Undefined if none of the artist's tracks are rated (a rated artist can still score 0). */
export const artistScore = (tracks: Pick<Track, 'score' | 'notASong' | 'live'>[]): number | undefined => {
  // Live recordings of songs they already have count for their album, not for them (state/live.ts).
  const rated = tracks.filter(t => t.score !== undefined && !t.notASong && !t.live)
  if (!rated.length) return undefined
  // rounded to 0.1 like v1's displayed scores, which also stops 0.1 + 0.2 style float noise
  return Math.round(rated.reduce((sum, t) => sum + artistWeight(t.score!), 0) * 10) / 10
}
