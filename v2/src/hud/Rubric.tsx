import { useEffect, useRef, useState } from 'react'
import { tierRanges, TRACK_TIERS } from '../shared/tiers'
import './rubric.css'

const ranges = tierRanges(TRACK_TIERS, 100)

/**
 * RUBRIC: a small button in the bottom-left corner, above the item count, that opens a read-only guide to the song
 * tiers (v1's names, score ranges and colours) just above it. It's informational only. Closes on its ×, Esc, the
 * button again, or a click anywhere else.
 */
export const Rubric = () => {
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const popup = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!popup.current?.contains(t) && !button.current?.contains(t)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onDown) }
  }, [open])

  return <>
    <button ref={button} className={`rubric-button${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="rubric">
      RUBRIC
    </button>
    {open && <div ref={popup} id="rubric" className="rubric" role="dialog" aria-label="Song tiers">
      <button className="rubric-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
      <div className="rubric-title">SONG TIERS</div>
      <ol className="rubric-tiers">
        {ranges.map(r => <li key={r.name} className="rubric-tier" style={{ background: r.color }}>
          <span className="rubric-name">{r.name}</span>
          <span className="rubric-range">{r.from}–{r.to === 100 ? 100 : r.to - 1}</span>
        </li>)}
      </ol>
    </div>}
  </>
}
