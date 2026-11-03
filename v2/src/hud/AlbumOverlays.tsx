import { useEffect, useRef, useState } from 'react'
import type { Track } from '../shared/suggestions'
import { screenAnchors, useView } from '../scene/view'
import { ratingLabel, useStore } from '../state/store'
import { formatDuration, loadAlbumDetails, useAlbumLoads } from './albumDetails'
import './albumOverlays.css'

const GAP_PX = 14
const EDGE_PX = 12

/**
 * Keeps an overlay pinned beside an item on screen, every frame, using the position the 3D object publishes.
 * Sits to the right of the item, or to its left if there isn't room there. If it fits on neither side (narrow
 * phone screens), it goes above or below the item, whichever has more room, and shrinks to fit, so it never
 * covers the item it belongs to.
 */
const usePinned = (id: string | null, ref: React.RefObject<HTMLElement | null>, align: 'top' | 'centre') => {
  useEffect(() => {
    if (!id) return
    let frame = 0
    const tick = () => {
      const el = ref.current
      const a = screenAnchors.get(id)
      if (el && a) {
        const w = el.offsetWidth
        const vw = window.innerWidth, vh = window.innerHeight
        const right = a.x + a.r + GAP_PX, left = a.x - a.r - GAP_PX - w
        let x: number, y: number
        if (right + w <= vw - EDGE_PX || left >= EDGE_PX) {
          el.style.maxHeight = ''
          const h = el.offsetHeight
          x = right + w <= vw - EDGE_PX ? right : left
          y = Math.min(Math.max(EDGE_PX, align === 'top' ? a.y - a.r : a.y - h / 2), vh - h - EDGE_PX)
        } else {
          const below = vh - (a.y + a.r + GAP_PX) - EDGE_PX, above = a.y - a.r - GAP_PX - EDGE_PX
          const room = Math.max(below, above)
          el.style.maxHeight = `${Math.max(120, Math.floor(room))}px`
          const h = el.offsetHeight
          x = Math.min(Math.max(EDGE_PX, a.x - w / 2), vw - w - EDGE_PX)
          y = below >= above ? a.y + a.r + GAP_PX : a.y - a.r - GAP_PX - h
        }
        el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
        el.style.visibility = a.visible ? 'visible' : 'hidden'
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [id, ref, align])
}

/** Hover card: artist, album, year, rating. Hidden while that album's popup is open (the popup shows the same). */
export const AlbumHoverCard = () => {
  const hoveredId = useView(v => v.hoveredId)
  const openId = useView(v => v.openId)
  const item = useStore(s => hoveredId ? s.items[hoveredId] : undefined)
  const rating = useStore(s => hoveredId ? ratingLabel(s, hoveredId) : '')
  const ref = useRef<HTMLDivElement>(null)
  const id = item && hoveredId !== openId ? hoveredId : null
  usePinned(id, ref, 'centre')
  if (!item || !id) return null

  return <div ref={ref} className="album-card" role="tooltip">
    <AlbumFacts artist={item.artist} album={item.name} year={item.year} rating={rating} />
  </div>
}

const AlbumFacts = ({ artist, album, year, rating }: { artist?: string, album: string, year?: number, rating: string }) =>
  <dl className="album-facts">
    <dt>ARTIST</dt><dd>{artist ?? '—'}</dd>
    <dt>ALBUM</dt><dd>{album}</dd>
    <dt>YEAR</dt><dd>{year ?? '—'}</dd>
    <dt>RATING</dt><dd className={rating === 'UNRATED' ? 'dim' : ''}>{rating}</dd>
  </dl>

/** How long the REMOVE button waits for its confirming second press. */
const CONFIRM_MS = 3000

type Draft = { name: string, year: string, tracks: Track[] }

/** Whole years between 1000 and 2999, or blank for "no year". */
const parseYear = (text: string): number | null | 'invalid' => {
  const t = text.trim()
  if (t === '') return null
  return /^[12]\d{3}$/.test(t) ? Number(t) : 'invalid'
}

/**
 * Tracklist popup beside the clicked album. Closes on its ×, Esc, clicking the album again, or a click on empty
 * space. Loads the tracklist if it isn't there yet (e.g. albums staged before tracklists existed).
 *
 * EDIT turns the title, year and track names into fields and lets tracks be deleted; nothing changes until SAVE
 * (CANCEL or Esc throws the draft away). REMOVE takes the album out of staging after a confirming second press.
 */
export const AlbumPopup = () => {
  const openId = useView(v => v.openId)
  const close = useView(v => v.close)
  const setEditing = useView(v => v.setEditing)
  const item = useStore(s => openId ? s.items[openId] : undefined)
  const rating = useStore(s => openId ? ratingLabel(s, openId) : '')
  const isStaged = useStore(s => !!openId && s.staged.some(st => st.itemId === openId && st.boardId === s.activeBoardId))
  const editItem = useStore(s => s.editItem)
  const removeStaged = useStore(s => s.removeStaged)
  const status = useAlbumLoads(s => openId ? s.status[openId] : undefined)
  const ref = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [confirming, setConfirming] = useState(false)
  usePinned(item ? openId : null, ref, 'top')

  // Fresh state for each album opened.
  useEffect(() => { setDraft(null); setConfirming(false) }, [openId])
  useEffect(() => { setEditing(draft !== null) }, [draft, setEditing])
  useEffect(() => { if (openId) void loadAlbumDetails(openId) }, [openId])
  useEffect(() => {
    if (!confirming) return
    const timer = setTimeout(() => setConfirming(false), CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [confirming])
  useEffect(() => {
    if (!openId) return
    // Esc leaves edit mode first, then closes.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (draft) setDraft(null); else close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, close, draft])

  if (!item || !openId) return null
  const tracks = item.tracks ?? []

  const startEdit = () => { setConfirming(false); setDraft({ name: item.name, year: item.year?.toString() ?? '', tracks }) }
  const year = draft ? parseYear(draft.year) : null
  const problem = !draft ? null
    : !draft.name.trim() ? 'The title can\'t be empty.'
    : year === 'invalid' ? 'The year should be four digits, or blank.'
    : draft.tracks.some(t => !t.name.trim()) ? 'Track names can\'t be empty.'
    : null
  const save = () => {
    if (!draft || problem || year === 'invalid') return
    if (editItem(openId, { name: draft.name, year, tracks: draft.tracks })) setDraft(null)
  }
  const remove = () => {
    if (!confirming) return setConfirming(true)
    removeStaged(openId)
    close()
  }

  const shown = draft ? draft.tracks : tracks
  const multiDisc = new Set(shown.map(t => t.disc)).size > 1
  const setTrackName = (id: string, name: string) => draft && setDraft({ ...draft, tracks: draft.tracks.map(t => t.id === id ? { ...t, name } : t) })
  const deleteTrack = (id: string) => draft && setDraft({ ...draft, tracks: draft.tracks.filter(t => t.id !== id) })

  return <div ref={ref} className={`album-popup${draft ? ' album-popup-editing' : ''}`} role="dialog" aria-label={`${item.name} tracklist`}>
    <button className="album-popup-close" onClick={close} aria-label="Close">×</button>
    {draft
      ? <>
          <input className="album-input album-input-title" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} aria-label="Title" autoFocus />
          <dl className="album-facts">
            <dt>ARTIST</dt><dd>{item.artist ?? '—'}</dd>
            <dt>YEAR</dt>
            <dd><input className="album-input album-input-year" value={draft.year} onChange={e => setDraft({ ...draft, year: e.target.value })} inputMode="numeric" maxLength={4} placeholder="—" aria-label="Year" /></dd>
            <dt>RATING</dt><dd className={rating === 'UNRATED' ? 'dim' : ''}>{rating}</dd>
          </dl>
        </>
      : <>
          <div className="album-popup-title">{item.name}</div>
          <AlbumFacts artist={item.artist} album={item.name} year={item.year} rating={rating} />
        </>}
    <div className="album-popup-divider" />
    {shown.length > 0
      ? <ol className="album-tracks">
          {shown.map((t, i) => {
            // In edit mode, show the numbering the tracks will have after saving.
            const number = draft ? shown.slice(0, i + 1).filter(x => x.disc === t.disc).length : t.number
            return <li key={t.id} className="album-track">
              {multiDisc && (i === 0 || shown[i - 1].disc !== t.disc) && <div className="album-disc">DISC {t.disc}</div>}
              <span className="album-track-no">{String(number).padStart(2, '0')}</span>
              {draft
                ? <input className="album-input album-input-track" value={t.name} onChange={e => setTrackName(t.id, e.target.value)} aria-label={`Track ${number} name`} />
                : <span className="album-track-name">{t.name}</span>}
              {draft
                ? <button className="album-track-delete" onClick={() => deleteTrack(t.id)} aria-label={`Delete ${t.name}`}>×</button>
                : <span className="album-track-time">{formatDuration(t.durationMs)}</span>}
            </li>
          })}
        </ol>
      : <div className="album-popup-hint">{
          draft ? 'No tracks.'
          : status === 'error' ? 'Tracklist unavailable right now.'
          : status === 'loading' || (item.source?.kind === 'album' && !item.tracks) ? 'Loading tracklist…'
          : 'No tracks.'}</div>}
    {problem && <div className="album-popup-problem" role="alert">{problem}</div>}
    <div className="album-popup-actions">
      {draft
        ? <>
            <button className="album-action" onClick={() => setDraft(null)}>CANCEL</button>
            <button className="album-action album-action-primary" onClick={save} disabled={!!problem}>SAVE</button>
          </>
        : <>
            {isStaged && <button className={`album-action album-action-danger${confirming ? ' confirming' : ''}`} onClick={remove}>{confirming ? 'CONFIRM REMOVE' : 'REMOVE'}</button>}
            <button className="album-action" onClick={startEdit}>EDIT</button>
          </>}
    </div>
  </div>
}
