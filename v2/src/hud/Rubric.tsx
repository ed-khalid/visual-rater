import { useEffect, useRef, useState } from 'react'
import { ARTIST_TIERS } from '../state/scores'
import { ALBUM_GRADES, ARTIST_GRADES, tierRanges, TRACK_TIERS, type Tier } from '../shared/tiers'
import './rubric.css'

/** Songs: whole-number ranges. */
const songRanges = tierRanges(TRACK_TIERS, 100).map(r => ({ ...r, range: `${r.from}–${r.to === 100 ? 100 : r.to - 1}` }))
/** Albums and artists: their scores aren't whole numbers, so each grade is shown by where it starts. */
const fromRanges = (tiers: Tier[]) => tiers.map(t => ({ ...t, range: t.from === 0 ? `under ${tiers[tiers.length - 2].from}` : `${t.from}+` }))

/** What a song adds to its artist's score, by its tier (named and coloured as in the song tiers). */
const ARTIST_POINTS = ARTIST_TIERS.map(t => {
  const tier = TRACK_TIERS.find(x => x.from === t.from)!
  return { name: tier.name, color: tier.color, weight: t.weight }
})
const LOWEST_COUNTED = ARTIST_POINTS[ARTIST_POINTS.length - 1]

/**
 * RUBRIC: a small button in the bottom-left corner, above the item count, that opens a read-only guide just above it,
 * in three columns side by side (stacked on phones): song tiers (v1's names, score ranges and colours), and how album and artist scores are worked out
 * (state/scores.ts) with their letter grades. It's informational only. Closes on its ×, Esc, the
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
    {open && <div ref={popup} id="rubric" className="rubric" role="dialog" aria-label="Rubric">
      <button className="rubric-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
      <div className="rubric-title">Rubric</div>
      <div className="rubric-columns">
        <section className="rubric-column" aria-label="Songs">
          <h3 className="rubric-heading">Songs</h3>
          <p className="rubric-text">Each song is scored 0–100 by where it sits on the rater.</p>
          <Tiers rows={songRanges} />
        </section>
        <section className="rubric-column" aria-label="Albums">
          <h3 className="rubric-heading">Albums</h3>
          <p className="rubric-text">The average score of its rated songs. Unrated songs don't count.</p>
          <Tiers rows={fromRanges(ALBUM_GRADES)} />
        </section>
        <section className="rubric-column" aria-label="Artists">
          <h3 className="rubric-heading">Artists</h3>
          <p className="rubric-text">Points for every rated song in the top tiers, added up, so it grows with each great song and has
            no ceiling. Songs below <Chip t={LOWEST_COUNTED} /> add nothing.</p>
          <ul className="rubric-points">
            {ARTIST_POINTS.map(p => <li key={p.name}>
              Every <Chip t={p} /> adds <b>{p.weight}</b> {p.weight === 1 ? 'point' : 'points'}
            </li>)}
          </ul>
          <Tiers rows={fromRanges(ARTIST_GRADES)} />
        </section>
      </div>
    </div>}
  </>
}

const Tiers = ({ rows }: { rows: { name: string, color: string, range: string }[] }) =>
  <ol className="rubric-tiers">
    {rows.map(r => <li key={r.name} className="rubric-tier" style={{ background: r.color }}>
      <span className="rubric-name">{r.name}</span>
      <span className="rubric-range">{r.range}</span>
    </li>)}
  </ol>

/** A song tier's name on its colour, as in the song tiers list. */
const Chip = ({ t }: { t: { name: string, color: string } }) =>
  <span className="rubric-chip" style={{ background: t.color }}>{t.name}</span>
