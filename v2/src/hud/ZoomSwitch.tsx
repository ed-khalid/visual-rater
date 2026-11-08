import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { isSplit, useView, type Zoom } from '../scene/view'
import './zoomSwitch.css'

const LEVELS: { zoom: Zoom, label: string }[] = [
  { zoom: 'artists', label: 'Artists' },
  { zoom: 'albums', label: 'Albums' },
  { zoom: 'songs', label: 'Songs' },
]
const LAST = LEVELS.length - 1

/**
 * The rater's zoom (MUSIC), at the bottom of the rater's area: a slider with three stops, artists, albums and songs,
 * for every artist on the rater (or just the one picked; view.drill), leaving out albums taken off it in the rater
 * contents. Drag the knob (it snaps to the nearest stop when let go), tap a stop or its word, or use the arrow keys.
 * Hidden in album view and split view, which show songs their own way.
 */
export const ZoomSwitch = () => {
  const zoom = useView(v => v.zoom)
  const setZoom = useView(v => v.setZoom)
  const hidden = useView(v => !!v.albumView || isSplit(v) || v.phase !== 'tree')
  const track = useRef<HTMLDivElement>(null)
  /** While dragging: where the knob is, 0 to LAST (fractional); otherwise null and the knob sits on its stop. */
  const [dragAt, setDragAt] = useState<number | null>(null)
  if (hidden) return null

  const index = LEVELS.findIndex(l => l.zoom === zoom)
  const go = (i: number) => { const z = LEVELS[Math.max(0, Math.min(LAST, i))].zoom; if (z !== zoom) setZoom(z) }
  const at = (e: React.PointerEvent) => {
    const r = track.current!.getBoundingClientRect()
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * LAST
  }
  const shown = dragAt ?? index
  const near = Math.round(shown)

  return <div className="zoom-slider">
    <div ref={track} className={`zoom-slider-track${dragAt !== null ? ' dragging' : ''}`} role="slider" tabIndex={0}
      aria-label="Zoom" aria-valuemin={0} aria-valuemax={LAST} aria-valuenow={index} aria-valuetext={LEVELS[index].label}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setDragAt(at(e)) }}
      onPointerMove={e => { if (dragAt !== null) setDragAt(at(e)) }}
      onPointerUp={e => { if (dragAt !== null) { go(Math.round(at(e))); setDragAt(null) } }}
      onPointerCancel={() => setDragAt(null)}
      onKeyDown={e => {
        const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0
        if (step) { e.preventDefault(); go(index + step) }
        else if (e.key === 'Home') { e.preventDefault(); go(0) }
        else if (e.key === 'End') { e.preventDefault(); go(LAST) }
      }}>
      <span className="zoom-slider-rail" />
      <motion.span className="zoom-slider-fill" initial={false} animate={{ scaleX: shown / LAST }}
        transition={dragAt !== null ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />
      {LEVELS.map((l, i) => <span key={l.zoom} className={`zoom-slider-stop${i <= near ? ' passed' : ''}`} style={{ left: `${(i / LAST) * 100}%` }} />)}
      <motion.span className="zoom-slider-knob" initial={false} animate={{ left: `${(shown / LAST) * 100}%` }}
        transition={dragAt !== null ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }} />
    </div>
    <div className="zoom-slider-labels">
      {LEVELS.map((l, i) => <button key={l.zoom} tabIndex={-1} className={`zoom-slider-label${i === near ? ' on' : ''}`}
        style={{ left: `${(i / LAST) * 100}%` }} onClick={() => go(i)}>{l.label}</button>)}
    </div>
  </div>
}
