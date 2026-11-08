import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { collapse, screenAnchors, TRUNK_BOTTOM_ANCHOR, TRUNK_TOP_ANCHOR, useView } from '../scene/view'
import type { Track } from '../shared/model'
import { rating, treeNodes } from '../state/board'
import { usePersisted, useStore } from '../state/store'
import './listView.css'

/** The list's widest (table plus padding), its gaps to the screen's edges and corners (CSS px). */
const LIST_MAX_WIDTH = 940
const EDGE_PX = 10
const LIST_TOP_MIN_PX = 88
const LIST_BOTTOM_GAP_PX = 78

/**
 * The list view: instead of the tree, a plain table of everything on it (what the tree shows: not hidden, not
 * still staged), best first, 100 down to 0, with each one's tier in its v1 colour; unrated ones last. Read-only.
 *
 * It opens out of the trunk like a scroll: while the tree sinks into the trunk, a glowing line stands in for it;
 * then two copies of it pop out to either side, sliding apart to the list's edges with the list unrolling between
 * them, and stretch up and down to its full height, where they stay as its borders. Closing rolls it back up into
 * the line, and the tree grows out again.
 */
export const ListView = () => {
  const activeType = useStore(s => s.activeType)
  const s = usePersisted()
  const music = activeType === 'music'
  const phase = useView(v => v.phase)
  const setPhase = useView(v => v.setPhase)
  const root = useRef<HTMLDivElement>(null)

  // Where the trunk is on screen (the line, and where the scroll opens from), and where the list's edges end up.
  useLayoutEffect(() => {
    let frame = 0
    const place = () => {
      const top = screenAnchors.get(TRUNK_TOP_ANCHOR), bottom = screenAnchors.get(TRUNK_BOTTOM_ANCHOR), el = root.current
      // Coming from split view, the one rater (and its spine's anchors) only appears with the list: try next frame.
      if (!el || !top || !bottom) { frame = requestAnimationFrame(place); return }
      const vw = window.innerWidth, vh = window.innerHeight
      const switchBottom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mode-switch-bottom')) || 70
      const left = Math.max(EDGE_PX, Math.round((vw - LIST_MAX_WIDTH) / 2))
      const vars: Record<string, number> = {
        'trunk-x': Math.round(top.x), 'trunk-top': Math.round(top.y), 'trunk-bottom': Math.round(bottom.y),
        'list-left': left, 'list-right': vw - left,
        'list-top': Math.round(Math.max(LIST_TOP_MIN_PX, switchBottom + 14)), 'list-bottom': vh - LIST_BOTTOM_GAP_PX,
      }
      for (const [k, v] of Object.entries(vars)) el.style.setProperty(`--${k}`, `${v}px`)
    }
    place()
    window.addEventListener('resize', place)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', place) }
  }, [])

  // The list only starts opening once the tree has fully sunk into the trunk (however long that takes to draw).
  const [sunk, setSunk] = useState(false)
  useEffect(() => {
    if (phase !== 'to-list') return
    let frame = 0
    const tick = () => { if (collapse.value >= 0.999) setSunk(true); else frame = requestAnimationFrame(tick) }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [phase])

  const onAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget.querySelector('.list-panel') || e.animationName !== 'list-unroll') return
    if (phase === 'to-list') setPhase('list')
    if (phase === 'to-tree') setPhase('tree')
  }

  const rows = useMemo(() => {
    if (!activeType) return []
    return treeNodes(s, activeType)
      .map(n => {
        const t = n.collection === 'tracks' ? n.entity as Track : undefined
        return {
          id: n.id,
          name: n.entity.name,
          artist: t?.artistId ? s.artists[t.artistId]?.name : undefined,
          album: t?.albumId ? s.albums[t.albumId]?.name : undefined,
          score: n.entity.score,
          rating: rating(s, n.id),
        }
      })
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.name.localeCompare(b.name))
  }, [s, activeType])

  return <div ref={root} className={`list-view list-${phase}${sunk ? ' list-sunk' : ''}`} onAnimationEnd={onAnimationEnd}>
    <div className="list-line" aria-hidden="true" />
    <div className="list-rod list-rod-left" aria-hidden="true" />
    <div className="list-rod list-rod-right" aria-hidden="true" />
    <div className="list-panel">
    <table className="list-table">
      <thead>
        <tr>
          <th className="list-rank">#</th>
          <th>{music ? 'SONG' : 'NAME'}</th>
          {music && <><th className="list-artist">ARTIST</th><th className="list-album">ALBUM</th></>}
          <th className="list-score">SCORE</th>
          {music && <th className="list-tier">TIER</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => <tr key={r.id} className={r.score === undefined ? 'list-unrated' : undefined} style={{ ['--row' as string]: i }}>
          <td className="list-rank">{r.score === undefined ? '' : i + 1}</td>
          <td className="list-name" title={r.name}>{r.name}</td>
          {music && <>
            <td className="list-artist" title={r.artist}>{r.artist ?? '—'}</td>
            <td className="list-album" title={r.album}>{r.album ?? '—'}</td>
          </>}
          <td className="list-score">{r.rating.label}</td>
          {music && <td className="list-tier">
            {r.rating.tier && <span className="tier-chip" style={{ background: r.rating.tier.color }}>{r.rating.tier.name}</span>}
          </td>}
        </tr>)}
      </tbody>
    </table>
  </div>
  </div>
}
