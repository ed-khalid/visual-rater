import type { Persisted } from '../shared/model'
import { UNRATED_POSITION } from './board'
import { albumScore, artistScore } from './scores'

/**
 * MUSIC's default view: a read-only rater of artists. Click an artist and every artist draws back into the spine,
 * then that artist's albums come out instead. Nothing here is stored or dragged: each node's height is worked out
 * from its tracks' scores, and the board places it fresh (state/place.ts) every time.
 *
 * - Artists: those with an album on the tree (not taken off the rater in the catalog). Height: the artist score itself,
 *   capped at 100 (artist scores are open-ended); unrated (none of their tracks rated) sit mid-spine.
 * - Albums of one artist: those on the tree and not hidden. Height: the album score.
 */
export type DrillNode = { id: string, kind: 'artist' | 'album', name: string, image?: string, colors?: string[], score?: number, position: number }

const positionFor = (score: number | undefined) => score === undefined ? UNRATED_POSITION : Math.min(100, Math.max(0, score)) / 100

/** Albums on the tree, oldest first, leaving out those taken off the rater in the catalog. */
const onTree = (s: Persisted, hidden: ReadonlySet<string>) =>
  Object.values(s.albums).filter(a => a.addedAt !== undefined && !hidden.has(a.id)).sort((a, b) => a.addedAt! - b.addedAt!)

export const artistNodes = (s: Persisted, hidden: ReadonlySet<string>): DrillNode[] => {
  const ids = [...new Set(onTree(s, hidden).map(a => a.artistId).filter((id): id is string => !!id && !!s.artists[id]))]
  const tracks = Object.values(s.tracks)
  return ids.map(id => {
    const a = s.artists[id], score = artistScore(tracks.filter(t => t.artistId === id))
    return { id, kind: 'artist', name: a.name, image: a.image, colors: a.colors, score, position: positionFor(score) }
  })
}

export const albumNodes = (s: Persisted, hidden: ReadonlySet<string>, artistId: string): DrillNode[] => {
  const tracks = Object.values(s.tracks)
  return onTree(s, hidden).filter(a => a.artistId === artistId).map(a => {
    const score = albumScore(tracks.filter(t => t.albumId === a.id))
    return { id: a.id, kind: 'album', name: a.name, image: a.image, colors: a.colors, score, position: positionFor(score) }
  })
}
