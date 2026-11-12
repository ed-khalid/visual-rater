import { useEffect, useRef, useState } from 'react'
import { trackCover } from '../scene/cover'
import { liveScores, screenAnchors, useView } from '../scene/view'
import { roundToShown } from '../shared/scale'
import { formatScore, nearestFirst, SAME_SCORE_RANGE, sameScore, songTier } from '../state/board'
import { usePersisted, useStore } from '../state/store'
import type { NearTrack, Simple, Track } from '../shared/model'
import './scoreMatches.css'

/** How long a dragged item has to stay on the same score (as shown) before its matches fade in. */
const DWELL_MS = 600
const WIDTH = 248
const GAP_PX = 16
const LIMIT = 5

/**
 * While an item is dragged and held on one score for a moment, a small card beside it fades in with the items
 * already rated at that score (or nearest it, within a couple of points; board.sameScore), so the new one can be
 * placed against them. Moving to another score hides it until the drag settles again. On MUSIC, the songs of artists
 * not loaded yet come from the server (GET /api/library/tracks/near); the card waits for them.
 */
export const ScoreMatches = () => {
  const draggingId = useView(v => v.draggingId)
  const type = useStore(s => s.activeType)
  const s = usePersisted()
  const [held, setHeld] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  /** MUSIC: the database's songs at or near `held` (null until they're in; empty if the lookup failed). */
  const [remote, setRemote] = useState<{ held: number, tracks: NearTrack[] } | null>(null)
  useEffect(() => {
    if (held === null || !draggingId || type !== 'music') return
    let live = true
    fetch(`/api/library/tracks/near?score=${held}&range=${SAME_SCORE_RANGE}&limit=${LIMIT}&exclude=${draggingId}`)
      .then(async res => { if (!res.ok) throw new Error(String(res.status)); return (await res.json() as { tracks: NearTrack[] }).tracks })
      .catch(() => [] as NearTrack[])
      .then(tracks => { if (live) setRemote({ held, tracks }) })
    return () => { live = false }
  }, [held, draggingId, type])

  useEffect(() => {
    setHeld(null)
    if (!draggingId) return
    let frame = 0, last: number | null = null, since = 0, shown: number | null = null
    const tick = (now: number) => {
      const live = liveScores.get(draggingId)
      const r = live === undefined ? null : roundToShown(live)
      if (r !== last) { last = r; since = now; if (shown !== null) { shown = null; setHeld(null) } }
      else if (r !== null && shown === null && now - since >= DWELL_MS) { shown = r; setHeld(r) }
      // Beside the fruit, on the right unless there's no room there.
      const el = ref.current, a = screenAnchors.get(draggingId)
      if (el && a) {
        const right = a.x + a.r + GAP_PX
        const x = right + WIDTH < window.innerWidth - 12 ? right : a.x - a.r - GAP_PX - WIDTH
        const y = Math.min(Math.max(a.y - el.offsetHeight / 2, 12), window.innerHeight - el.offsetHeight - 12)
        el.style.transform = `translate(${Math.round(Math.max(12, x))}px, ${Math.round(y)}px)`
        el.style.visibility = a.visible ? 'visible' : 'hidden'
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [draggingId])

  if (!draggingId || held === null || !type) return null
  const music = type === 'music'
  if (music && remote?.held !== held) return null
  // What's here is the latest; the database adds the songs of artists not loaded yet.
  const local = sameScore(s, type, held, draggingId, LIMIT) as (Track | Simple)[]
  const others = music ? remote!.tracks.filter(t => !(t.id in s.tracks)) : []
  const matches = [...local, ...others].sort(nearestFirst(held)).slice(0, LIMIT)
  if (matches.length === 0) return null
  return <div ref={ref} key={held} className="score-matches" role="status" aria-label={`Rated ${formatScore(held)} or near it`}>
    {matches.map(m => {
      const t = m as NearTrack
      const album = music && t.albumId ? s.albums[t.albumId] : undefined
      const artist = music && t.artistId ? s.artists[t.artistId] : undefined
      const albumName = album?.name ?? t.albumName, artistName = artist?.name ?? t.artistName
      const image = album?.image ?? trackCover(m, album)
      const tier = music ? songTier(m.score!) : undefined
      return <div className="score-match" key={m.id}>
        {image ? <img className="score-match-thumb" src={image} alt="" draggable={false} /> : <span className="score-match-thumb" />}
        <span className="score-match-names">
          <span className="score-match-name">{m.name}</span>
          {(albumName || artistName) && <span className="score-match-detail">{[artistName, albumName].filter(Boolean).join(' · ')}</span>}
        </span>
        <span className="score-match-score">{formatScore(m.score!)}</span>
        {tier && <span className="score-match-tier" style={{ background: tier.color }} title={tier.name} />}
      </div>
    })}
  </div>
}
