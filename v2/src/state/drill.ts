import type { Persisted } from '../shared/model'
import { UNRATED_POSITION } from './board'
import { ALIGN_MIN_LENGTH, FRUIT_RADIUS, MAX_BRANCH_LENGTH, TRUNK_HEIGHT } from './layout'
import { albumScore, artistScore } from './scores'

/**
 * MUSIC's default view: a read-only rater of artists. Click an artist and its fruit (and every other artist's) draw
 * back into the trunk, then that artist's albums come out instead. Nothing here is stored or dragged: each node's
 * height is worked out from its tracks' scores and its branch is laid out fresh (spreadNodes) every time.
 *
 * - Artists: those with an album on the tree (not hidden from the rater contents). Height: the artist score itself,
 *   capped at 100 (artist scores are open-ended); unrated (none of their tracks rated) sit mid-trunk.
 * - Albums of one artist: those on the tree and not hidden. Height: the album score.
 */
export type DrillNode = { id: string, kind: 'artist' | 'album', name: string, image?: string, colors?: string[], score?: number, position: number }

const positionFor = (score: number | undefined) => score === undefined ? UNRATED_POSITION : Math.min(100, Math.max(0, score)) / 100

/** Albums on the tree, oldest first, leaving out those hidden from the rater contents. */
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

/** Right of the trunk from the front view, and left (branch angles: a branch at angle a points along (sin a, cos a)). */
const RIGHT = Math.PI / 2, LEFT = -Math.PI / 2

/**
 * A branch for each node, on the main plane: each goes on whichever side has fewer so far (ties: right), on the
 * shortest stem that keeps it clear of the nodes already on that side (`radius`: the nodes' drawn radius).
 */
export const spreadNodes = (nodes: { id: string, position: number }[], radius = FRUIT_RADIUS): Map<string, { angle: number, length: number }> => {
  const placed: { side: number, y: number, length: number }[] = []
  const out = new Map<string, { angle: number, length: number }>()
  const gap = radius * 2 + 0.12
  for (const n of nodes) {
    const y = n.position * TRUNK_HEIGHT
    const count = (side: number) => placed.filter(p => p.side === side).length
    const side = count(RIGHT) <= count(LEFT) ? RIGHT : LEFT
    const near = placed.filter(p => p.side === side && Math.abs(p.y - y) < gap)
    let length = Math.max(ALIGN_MIN_LENGTH, radius + 0.5)
    while (length < MAX_BRANCH_LENGTH && near.some(p => Math.hypot(p.length - length, p.y - y) < gap)) length += gap / 2
    placed.push({ side, y, length })
    out.set(n.id, { angle: side, length })
  }
  return out
}
