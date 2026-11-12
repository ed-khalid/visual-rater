import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useBox } from '../scene/box'
import { collapse, useView } from '../scene/view'
import type { Track } from '../shared/model'
import { rating, treeNodes } from '../state/board'
import { albumNodes, artistNodes } from '../state/drill'
import { SCALE, toStored } from '../shared/scale'
import { scoreToPosition, usePersisted, useStore } from '../state/store'
import './listView.css'

/** How far the list reaches below the spine's bottom end (CSS px): over the scale's 0. */
const LIST_BELOW_SPINE_PX = 16

/**
 * The list view: in the rater's place (its area: catalog, breadcrumb, album and artist view stay as they are), a plain
 * table, best first, unrated (or incomplete) last. On MUSIC it lists the zoom slider's level, as the rater would show it:
 * artists or albums (just the picked artist's, with view.drill) with score and grade, read-only; or songs (everything
 * the tree shows: not hidden, not still staged) with their tier, whose scores can be typed in. Albums and artists
 * taken off the rater in the catalog (view.hiddenAlbums) are left out at every level. Off MUSIC, everything.
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
  // MUSIC lists what the zoom slider is on: artists or albums (read-only), or songs (scores can be typed in).
  const zoom = useView(v => v.zoom), drill = useView(v => v.drill), hiddenAlbums = useView(v => v.hiddenAlbums)
  const level = music ? zoom : 'songs'
  const setPhase = useView(v => v.setPhase)

  // Where the spine is (the line, and where the scroll opens from), and the rater's area, which the list fills.
  const box = useBox()
  const area = {
    'trunk-x': box.spineX, 'trunk-top': box.top, 'trunk-bottom': box.top + box.height,
    'list-left': box.areaLeft, 'list-right': box.w - box.gutter, 'list-top': box.top,
    // past the spine's bottom, so the 0 under it is covered too
    'list-bottom': box.top + box.height + LIST_BELOW_SPINE_PX,
  }
  const vars = Object.fromEntries(Object.entries(area).map(([k, v]) => [`--${k}`, `${Math.round(v)}px`])) as React.CSSProperties

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

  // Editing a score: the row being edited, and the one just changed (it lights up where it lands).
  const [editing, setEditing] = useState<string | null>(null)
  const [edited, setEdited] = useState<{ id: string, at: number } | null>(null)
  const panel = useRef<HTMLDivElement>(null)
  const move = useStore(st => st.move)
  const unrate = useStore(st => st.unrate)
  const commit = (id: string, text: string, shown: string) => {
    setEditing(null)
    const t = text.trim()
    // Unchanged (the shown, rounded score) or not a score: nothing changes, so a song dragged between steps stays there.
    if (t === shown) return
    // Emptied: no score any more, unrated again.
    if (t === '') { unrate(id); setEdited({ id, at: Date.now() }); return }
    // Typed on the scale shown (0–5, say); stored 0–100, snapped to the scale's steps by move.
    const v = Number(t.replace(',', '.'))
    if (!Number.isFinite(v) || v < 0 || v > SCALE.max) return
    move(id, { position: scoreToPosition(toStored(v)) })
    setEdited({ id, at: Date.now() })
  }
  // The changed row slides to its new place; the list follows it there if it leaves the screen.
  useEffect(() => {
    if (!edited) return
    // Where it ends up (offsetTop ignores the slide's transform), centred if that's off screen; scrolling alongside the slide.
    const el = panel.current, row = el?.querySelector<HTMLElement>(`[data-id="${edited.id}"]`)
    if (el && row) {
      const top = row.offsetTop + (row.closest('table')?.offsetTop ?? 0), head = row.closest('table')?.tHead?.offsetHeight ?? 0
      if (top < el.scrollTop + head || top + row.offsetHeight > el.scrollTop + el.clientHeight) {
        el.scrollTo({ top: top - el.clientHeight / 2, behavior: 'smooth' })
      }
    }
    const over = setTimeout(() => setEdited(null), 2000)
    return () => clearTimeout(over)
  }, [edited])

  const rows = useMemo((): Row[] => {
    if (!activeType) return []
    let rows: Row[]
    if (level === 'artists') {
      rows = artistNodes(s, hiddenAlbums).map(n => ({ id: n.id, name: n.name, score: n.score, rating: rating(s, n.id) }))
    } else if (level === 'albums') {
      // Every artist's albums on the rater, or just the one picked (as on the rater).
      const artists = drill ? [drill] : artistNodes(s, hiddenAlbums).map(n => n.id)
      rows = artists.flatMap(a => albumNodes(s, hiddenAlbums, a).map(n => {
        const album = s.albums[n.id]
        return { id: n.id, name: n.name, artist: s.artists[a]?.name, year: album?.year, score: n.score, rating: rating(s, n.id) }
      }))
    } else {
      // songs on albums taken off the rater in the catalog are left out, as there
      rows = treeNodes(s, activeType).filter(n => !(n.collection === 'tracks' && hiddenAlbums.has((n.entity as Track).albumId ?? ''))).map(n => {
        const t = n.collection === 'tracks' ? n.entity as Track : undefined
        return {
          id: n.id,
          name: n.entity.name,
          artist: t?.artistId ? s.artists[t.artistId]?.name : undefined,
          album: t?.albumId ? s.albums[t.albumId]?.name : undefined,
          albumId: t?.albumId,
          score: n.entity.score,
          rating: rating(s, n.id),
          editable: true,
        }
      })
    }
    return rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.name.localeCompare(b.name))
  }, [s, activeType, level, drill, hiddenAlbums])

  return <div className={`list-view list-${phase}${sunk ? ' list-sunk' : ''}`} style={vars} onAnimationEnd={onAnimationEnd}>
    <div className="list-line" aria-hidden="true" />
    <div className="list-rod list-rod-left" aria-hidden="true" />
    <div className="list-rod list-rod-right" aria-hidden="true" />
    {/* layoutScroll: the rows' slides are measured with the list's scroll taken into account */}
    <motion.div ref={panel} className="list-panel" layoutScroll>
    <table className="list-table">
      <thead>
        <tr>
          <th className="list-rank">#</th>
          <th>{level === 'artists' ? 'ARTIST' : level === 'albums' ? 'ALBUM' : music ? 'SONG' : 'NAME'}</th>
          {level === 'albums' && <><th className="list-artist">ARTIST</th><th className="list-year">YEAR</th></>}
          {level === 'songs' && music && <><th className="list-artist">ARTIST</th><th className="list-album">ALBUM</th></>}
          <th className="list-score">SCORE</th>
          {music && <th className={`list-tier${level === 'songs' ? '' : ' list-grade'}`}>{level === 'songs' ? 'TIER' : 'GRADE'}</th>}
        </tr>
      </thead>
      {/* a new level's rows rise in afresh */}
      <tbody key={level}>
        {rows.map((r, i) => <motion.tr key={r.id} layout="position" transition={{ type: 'spring', stiffness: 170, damping: 26 }} data-id={r.id}
          className={[r.score === undefined ? 'list-unrated' : '', edited?.id === r.id ? 'list-edited' : ''].filter(Boolean).join(' ') || undefined}
          style={{ ['--row' as string]: i }}>
          <td className="list-rank">{r.score === undefined ? '' : i + 1}</td>
          <td className="list-name" title={r.name}>
            {level === 'albums' ? <AlbumLink id={r.id} name={r.name} /> : r.name}
          </td>
          {level === 'albums' && <>
            <td className="list-artist" title={r.artist}>{r.artist ?? '—'}</td>
            <td className="list-year">{r.year ?? '—'}</td>
          </>}
          {level === 'songs' && music && <>
            <td className="list-artist" title={r.artist}>{r.artist ?? '—'}</td>
            <td className="list-album" title={r.album}>{r.albumId && r.album ? <AlbumLink id={r.albumId} name={r.album} /> : r.album ?? '—'}</td>
          </>}
          <td className="list-score">
            {editing === r.id
              ? <ScoreInput initial={r.score === undefined ? '' : r.rating.label} label={`Score for ${r.name}`}
                onDone={text => commit(r.id, text, r.score === undefined ? '' : r.rating.label)} onCancel={() => setEditing(null)} />
              : <>{r.editable && <button className="list-edit" onClick={() => setEditing(r.id)} aria-label={`Edit the score for ${r.name}`}><Pencil /></button>}
                <span className="list-score-value" key={edited?.id === r.id ? edited.at : undefined}>{r.rating.label}</span></>}
          </td>
          {music && <td className={`list-tier${level === 'songs' ? '' : ' list-grade'}`}>
            {r.rating.tier && <span className="tier-chip" style={{ background: r.rating.tier.color }}>{r.rating.tier.name}</span>}
          </td>}
        </motion.tr>)}
      </tbody>
    </table>
  </motion.div>
  </div>
}

type Row = { id: string, name: string, artist?: string, album?: string, albumId?: string, year?: number, score?: number, rating: { label: string, tier?: { name: string, color: string } }, editable?: boolean }

/** An album's title in the list: opens album view on it. */
const AlbumLink = ({ id, name }: { id: string, name: string }) =>
  <button className="list-album-link" onClick={() => useView.getState().setAlbumView(id)}>{name}</button>

const Pencil = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
  <path d="M8.6 1.9l2.5 2.5-6.9 6.9-3.1.6.6-3.1z" /><path d="M7.3 3.2l2.5 2.5" />
</svg>

/** A score being typed in: Enter or leaving the field keeps it, Esc lets it go. */
const ScoreInput = ({ initial, label, onDone, onCancel }: { initial: string, label: string, onDone: (text: string) => void, onCancel: () => void }) => {
  const done = useRef(false)
  const finish = (f: () => void) => { if (!done.current) { done.current = true; f() } }
  return <input className="list-score-input" defaultValue={initial} inputMode="decimal" autoComplete="off" aria-label={label}
    autoFocus onFocus={e => e.currentTarget.select()}
    onKeyDown={e => {
      // Its keys stay here: Esc mustn't also close album view behind the list.
      e.stopPropagation()
      if (e.key === 'Enter') { e.preventDefault(); finish(() => onDone(e.currentTarget.value)) }
      if (e.key === 'Escape') { e.preventDefault(); finish(onCancel) }
    }}
    onBlur={e => finish(() => onDone(e.currentTarget.value))} />
}
