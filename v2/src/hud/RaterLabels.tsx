import { useEffect, useMemo, useRef } from 'react'
import { isSplit, raterBottomAnchor, screenAnchors, useView } from '../scene/view'
import { rating } from '../state/board'
import { SINGLES, splitLayout } from '../state/split'
import { usePersisted } from '../state/store'
import './raterLabels.css'

const GAP_PX = 10
/** Widest a tag gets; narrower when the next rater is closer than that on screen, and gone below the least. */
const MAX_WIDTH_PX = 160
const MIN_WIDTH_PX = 44

/**
 * Split view: under each rater's trunk, which album it is and its score (its letter grade's colour as a thin bar),
 * so a row of raters can be told apart and compared. They follow the trunks as the camera moves.
 */
export const RaterLabels = () => {
  const s = usePersisted()
  const split = useView(isSplit)
  const hidden = useView(v => v.hiddenAlbums)
  const moved = useView(v => v.raterPlaces)
  const spots = useMemo(() => split ? splitLayout(s, hidden, moved) : [], [s, split, hidden, moved])
  const els = useRef(new Map<string, HTMLElement>())

  useEffect(() => {
    if (!split) return
    let frame = 0
    const tick = () => {
      const at = [...els.current].map(([key, el]) => ({ el, a: screenAnchors.get(raterBottomAnchor(key)) }))
      for (const { el, a } of at) {
        if (!a) continue
        // As wide as the space to the nearest other rater on screen (they get close zoomed out, or moved side by side).
        let room = MAX_WIDTH_PX
        for (const o of at) if (o.a && o.el !== el && o.a.visible && Math.abs(o.a.y - a.y) < 30) room = Math.min(room, Math.abs(o.a.x - a.x) - 8)
        el.style.maxWidth = `${Math.max(0, Math.round(room))}px`
        el.style.transform = `translate(${Math.round(a.x)}px, ${Math.round(a.y + GAP_PX)}px) translate(-50%, 0)`
        el.style.opacity = a.visible && room >= MIN_WIDTH_PX ? '1' : '0'
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [split])

  if (!split) return null
  return <div className="rater-labels" aria-hidden="true">
    {spots.map(sp => {
      const album = sp.key === SINGLES ? undefined : s.albums[sp.key]
      const artist = album?.artistId ? s.artists[album.artistId]?.name : undefined
      const r = album ? rating(s, album.id) : undefined
      return <div key={sp.key} className="rater-label" ref={el => { if (el) els.current.set(sp.key, el); else els.current.delete(sp.key) }}>
        <span className="rater-label-bar" style={r?.tier ? { background: r.tier.color } : undefined} />
        <span className="rater-label-name">{album?.name ?? 'Singles'}</span>
        <span className="rater-label-meta">{[artist, r?.label].filter(Boolean).join(' · ')}</span>
      </div>
    })}
  </div>
}
