/**
 * Album and artist scores, worked out from their tracks' scores with the formulas the v1 app used
 * (backend/db/04.song_score_update.sql). The same formulas back the music_album_scores and music_artist_scores
 * views in the database (server/db/004), so the app and SQL agree.
 *
 * Only rated tracks count; a hidden track still counts (hiding keeps its score).
 */
import type { Track } from '../shared/model'

/** Album: the average score of its rated tracks. Undefined if none are rated. */
export const albumScore = (tracks: Pick<Track, 'score'>[]): number | undefined => {
  const rated = tracks.filter(t => t.score !== undefined)
  return rated.length ? rated.reduce((sum, t) => sum + t.score!, 0) / rated.length : undefined
}

/**
 * Artist: a weighted count of their tracks in the top tiers, so it grows with how many great songs they have and
 * has no upper limit (v1: Metallica 70.6, Radiohead 40.9). Tracks marked excludeFromArtistScore don't count.
 * Below 65 a track adds nothing.
 */
export const ARTIST_TIERS: { from: number, weight: number, name: string }[] = [
  { from: 95, weight: 6, name: 'classic' },
  { from: 90, weight: 4, name: 'great' },
  { from: 85, weight: 2, name: 'very good' },
  { from: 80, weight: 1, name: 'good' },
  { from: 75, weight: 0.5, name: 'pleasant' },
  { from: 70, weight: 0.5, name: 'decent' },
  { from: 65, weight: 0.1, name: 'interesting' },
]

/** What one track adds to its artist's score. */
export const artistWeight = (score: number) => ARTIST_TIERS.find(t => score >= t.from)?.weight ?? 0

/** Undefined if none of the artist's tracks are rated (a rated artist can still score 0). */
export const artistScore = (tracks: Pick<Track, 'score' | 'excludeFromArtistScore'>[]): number | undefined => {
  const rated = tracks.filter(t => t.score !== undefined && !t.excludeFromArtistScore)
  if (!rated.length) return undefined
  // rounded to 0.1 like v1's displayed scores, which also stops 0.1 + 0.2 style float noise
  return Math.round(rated.reduce((sum, t) => sum + artistWeight(t.score!), 0) * 10) / 10
}
