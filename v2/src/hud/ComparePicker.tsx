import { useEffect, useMemo, useRef, useState } from 'react'
import { useBox } from '../scene/box'
import { albumCover } from '../scene/cover'
import { useView } from '../scene/view'
import { INCOMPLETE, rating as ratingOf } from '../state/board'
import { usePersisted } from '../state/store'
import './comparePicker.css'

/**
 * Compare's picker, on the right half of the page: every album on the tree but the one in album view, its artist's
 * first, then by artist and year, narrowed by what's typed (album or artist name). A click, or Enter on the highlighted one (arrow keys move
 * it), puts it on the right. Esc closes it: back to the album shown before, or, with none yet, out of compare.
 */
export const ComparePicker = ({ exclude }: { exclude: string }) => {
  const s = usePersisted()
  const box = useBox(), c = box.compare
  const [q, setQ] = useState('')
  const [at, setAt] = useState(0)
  const list = useRef<HTMLUListElement>(null)
  const own = s.albums[exclude]?.artistId
  const albums = useMemo(() => Object.values(s.albums)
    .filter(a => a.addedAt !== undefined && a.id !== exclude)
    .map(a => ({ a, artist: a.artistId ? s.artists[a.artistId]?.name ?? '' : '' }))
    // the open album's artist first, then everyone by name; each artist's albums by year, Singles last
    .sort((x, y) => Number(y.a.artistId === own) - Number(x.a.artistId === own) || x.artist.localeCompare(y.artist) || Number(!!x.a.misc) - Number(!!y.a.misc) || (x.a.year ?? 9999) - (y.a.year ?? 9999) || x.a.name.localeCompare(y.a.name)),
  [s.albums, s.artists, exclude, own])
  const needle = q.trim().toLowerCase()
  const shown = needle ? albums.filter(x => x.a.name.toLowerCase().includes(needle) || x.artist.toLowerCase().includes(needle)) : albums
  useEffect(() => { setAt(0) }, [needle])
  useEffect(() => { list.current?.querySelector<HTMLElement>(`[data-at="${at}"]`)?.scrollIntoView({ block: 'nearest' }) }, [at])
  if (!c) return null

  const pick = (id: string) => useView.getState().setCompareWith(id)
  const close = () => { const v = useView.getState(); if (v.compareWith) v.setPicking(false); else v.endCompare() }
  const onKey = (e: React.KeyboardEvent) => {
    // Its keys stay here: Esc closes the picker, not album view.
    e.stopPropagation()
    if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setAt(i => Math.min(shown.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAt(i => Math.max(0, i - 1)) }
    else if (e.key === 'Enter' && shown[at]) { e.preventDefault(); pick(shown[at].a.id) }
  }

  // Centred in the right half of the page.
  const half = box.w / 2, width = Math.min(440, half - c.edge - 40)
  return <div className="compare-picker" role="dialog" aria-label="Compare with" style={{ right: c.edge + (half - c.edge - width) / 2, width }}
    onKeyDown={onKey} onClick={e => e.stopPropagation()}>
    <div className="compare-picker-head">
      <span className="compare-picker-title">Compare with</span>
      <button className="compare-picker-close" onClick={close} aria-label="Close">×</button>
    </div>
    <input className="compare-picker-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Album or artist" autoFocus autoComplete="off" aria-label="Album or artist" />
    <ul ref={list} className="compare-picker-list">
      {shown.map(({ a, artist }, i) => {
        const r = a.misc ? null : ratingOf(s, a.id)
        return <li key={a.id}>
          <button data-at={i} className={`compare-picker-item${i === at ? ' on' : ''}`} onClick={() => pick(a.id)} onMouseEnter={() => setAt(i)}>
            {albumCover(a) ? <img src={albumCover(a)} alt="" draggable={false} /> : <span className="compare-picker-blank" />}
            <span className="compare-picker-names">
              <span className="compare-picker-name">{a.name}</span>
              <span className="compare-picker-meta">{[artist, a.misc ? null : a.year].filter(Boolean).join(' · ')}</span>
            </span>
            {r && (r.tier
              ? <span className="compare-picker-score">{r.label}<span className="compare-picker-grade" style={{ background: r.tier.color }}>{r.tier.name}</span></span>
              : <span className="compare-picker-score dim">{r.label === INCOMPLETE ? 'Incomplete' : 'Unrated'}</span>)}
          </button>
        </li>
      })}
      {shown.length === 0 && <li className="compare-picker-none">No albums match.</li>}
    </ul>
  </div>
}
