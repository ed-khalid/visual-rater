/**
 * Live recordings of songs the artist already has (Track.live): rated as usual and counted for their album, but not
 * for the artist, so a song doesn't count twice. Worked out when tracks are added, from what's loaded: a track that
 * looks live (shared/names.ts `looksLive`) is marked if the artist has a studio track of the same name on another
 * album (`songKey`); covers and songs that only exist live stay unmarked, so they count. When a studio album comes in
 * after the live one, the live tracks it matches are marked then. Changed by hand in album view's EDIT.
 */
import type { Album, Track } from '../shared/model'
import { looksLive, songKey } from '../shared/names'

/**
 * `tracks` with the live marks that `added` (tracks just created) call for: added live tracks matching a studio one,
 * and live tracks the added studio ones match. Only ever marks; never unmarks (that's EDIT's).
 */
export const markLive = (albums: Record<string, Album>, tracks: Record<string, Track>, added: Iterable<string>): Record<string, Track> => {
  const fresh = [...added].map(id => tracks[id]).filter((t): t is Track => !!t?.artistId)
  if (!fresh.length) return tracks
  const artists = new Set(fresh.map(t => t.artistId!))
  const live = (t: Track) => looksLive(t.name, t.albumId ? albums[t.albumId]?.name : '')
  const theirs = Object.values(tracks).filter(t => t.artistId && artists.has(t.artistId) && !t.notASong)
  // Studio songs, by artist and name: the albums they're on.
  const studio = new Map<string, Set<string | undefined>>()
  for (const t of theirs) if (!live(t)) {
    const k = `${t.artistId}:${songKey(t.name)}`
    studio.set(k, (studio.get(k) ?? new Set()).add(t.albumId))
  }
  const freshIds = new Set(fresh.map(t => t.id))
  const freshStudio = new Set(fresh.filter(t => !live(t)).map(t => `${t.artistId}:${songKey(t.name)}`))
  let out = tracks
  for (const t of theirs) {
    if (t.live || !live(t)) continue
    const k = `${t.artistId}:${songKey(t.name)}`
    const elsewhere = [...studio.get(k) ?? []].some(a => a !== t.albumId)
    if (elsewhere && (freshIds.has(t.id) || freshStudio.has(k))) {
      if (out === tracks) out = { ...tracks }
      out[t.id] = { ...t, live: true }
    }
  }
  return out
}
