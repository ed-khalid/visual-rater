import { useEffect, useRef, useState } from 'react'
import { liveScores, screenAnchors, useView } from '../scene/view'
import { formatScore, sameScore, songTier } from '../state/board'
import { usePersisted, useStore } from '../state/store'
import type { Track } from '../shared/model'
import './scoreMatches.css'

/** How long a dragged item has to stay on the same score (as shown) before its matches fade in. */
const DWELL_MS = 600
const WIDTH = 248
const GAP_PX = 16

/**
 * While an item is dragged and held on one score for a moment, a small card beside it fades in with the items
 * already rated at that score (or nearest it, within a couple of points; board.sameScore), so the new one can be
 * placed against them. Moving to another score hides it until the drag settles again.
 */
export const ScoreMatches = () => {
  const draggingId = useView(v => v.draggingId)
  const type = useStore(s => s.activeType)
  const s = usePersisted()
  const [held, setHeld] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHeld(null)
    if (!draggingId) return
    let frame = 0, last: number | null = null, since = 0, shown: number | null = null
    const tick = (now: number) => {
      const live = liveScores.get(draggingId)
      const r = live === undefined ? null : Math.round(live)
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
  const matches = sameScore(s, type, held, draggingId)
  if (matches.length === 0) return null
  const music = type === 'music'
  return <div ref={ref} key={held} className="score-matches" role="status" aria-label={`Rated ${formatScore(held)} or near it`}>
    {matches.map(m => {
      const t = m as Track
      const album = music && t.albumId ? s.albums[t.albumId] : undefined
      const artist = music && t.artistId ? s.artists[t.artistId] : undefined
      const image = album?.image ?? (m as { image?: string }).image
      const tier = music ? songTier(m.score!) : undefined
      return <div className="score-match" key={m.id}>
        {image ? <img className="score-match-thumb" src={image} alt="" draggable={false} /> : <span className="score-match-thumb" />}
        <span className="score-match-names">
          <span className="score-match-name">{m.name}</span>
          {(album || artist) && <span className="score-match-detail">{[artist?.name, album?.name].filter(Boolean).join(' · ')}</span>}
        </span>
        <span className="score-match-score">{formatScore(m.score!)}</span>
        {tier && <span className="score-match-tier" style={{ background: tier.color }} title={tier.name} />}
      </div>
    })}
  </div>
}
