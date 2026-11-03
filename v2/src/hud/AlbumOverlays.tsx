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

/** Hover card for albums: artist, album, year, rating. Hidden while that album's popup is open (it shows the same). */
export const AlbumHoverCard = () => {
  const hoveredId = useView(v => v.hoveredId)
  const openId = useView(v => v.openId)
  const item = useStore(s => hoveredId ? s.items[hoveredId] : undefined)
  const rating = useStore(s => hoveredId ? ratingLabel(s, hoveredId) : '')
  const ref = useRef<HTMLDivElement>(null)
  const isAlbum = item?.source?.kind === 'album' || item?.tracks !== undefined
  const id = item && isAlbum && hoveredId !== openId ? hoveredId : null
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
 * (CANCEL or Esc throws the draft away). Removing an album is the trash icon on its sphere (ItemTrash).
 */
export const AlbumPopup = () => {
  const openId = useView(v => v.openId)
  const close = useView(v => v.close)
  const setEditing = useView(v => v.setEditing)
  const item = useStore(s => openId ? s.items[openId] : undefined)
  const rating = useStore(s => openId ? ratingLabel(s, openId) : '')
  const editItem = useStore(s => s.editItem)
  const status = useAlbumLoads(s => openId ? s.status[openId] : undefined)
  const ref = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  usePinned(item ? openId : null, ref, 'top')

  // Fresh state for each album opened.
  useEffect(() => { setDraft(null) }, [openId])
  useEffect(() => { setEditing(draft !== null) }, [draft, setEditing])
  useEffect(() => { if (openId) void loadAlbumDetails(openId) }, [openId])
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

  const startEdit = () => { setDraft({ name: item.name, year: item.year?.toString() ?? '', tracks }) }
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
        : <button className="album-action" onClick={startEdit}>EDIT</button>}
    </div>
  </div>
}

/** How long the trash icon waits for its confirming second click. */
const CONFIRM_MS = 3000
/** Grace period after the pointer leaves the sphere, so it can travel onto the icon. */
const HIDE_DELAY_MS = 350
/** Fade-out time; keep in step with `.staged-trash.leaving` in albumOverlays.css (fade-in is 0.6s, CSS only). */
const FADE_OUT_MS = 200
const TRASH_PX = 26
/** Clear gap between the sphere's outline and the icon. */
const TRASH_GAP_PX = 4

/**
 * Trash icon just outside the top-left of an item's sphere, for anything on the board: staged albums and fruit on
 * the tree. Shown while the sphere is hovered, or while it's open/selected (how touch screens, with no hover, get
 * to it); hidden while editing. First click arms it (red), a second click within a few seconds removes the item.
 */
export const ItemTrash = () => {
  const hoveredId = useView(v => v.hoveredId)
  const openId = useView(v => v.openId)
  const editing = useView(v => v.editing)
  const close = useView(v => v.close)
  const selectedId = useView(v => v.selectedId)
  const onBoardIds = useStore(s => [...s.staged, ...s.placements].filter(x => x.boardId === s.activeBoardId).map(x => x.itemId).join(','))
  const removeFromBoard = useStore(s => s.removeFromBoard)
  const [target, setTarget] = useState<string | null>(null)
  /** Fading out: still on screen, on its way to being removed. */
  const [leaving, setLeaving] = useState(false)
  const [overIcon, setOverIcon] = useState(false)
  const [armed, setArmed] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  const wanted = editing ? null : [hoveredId, openId, selectedId].find(id => id && onBoardIds.split(',').includes(id)) ?? null

  // Follow the hovered/open sphere; when it goes, wait a moment (the pointer may be on its way to the icon).
  // Follow the hovered/open sphere. When it goes: wait a moment (the pointer may be on its way to the icon),
  // fade out, then unmount.
  useEffect(() => {
    if (wanted) {
      setLeaving(false)
      if (wanted !== target) { setTarget(wanted); setArmed(false) }
      return
    }
    if (!target) { setLeaving(false); return }
    // Entering edit mode hides it straight away; otherwise give the pointer a moment to reach the icon.
    const delay = editing ? 0 : HIDE_DELAY_MS
    if (overIcon && !editing) { setLeaving(false); return }
    const fade = setTimeout(() => setLeaving(true), delay)
    const gone = setTimeout(() => { setTarget(null); setArmed(false); setLeaving(false) }, delay + FADE_OUT_MS)
    return () => { clearTimeout(fade); clearTimeout(gone) }
  }, [wanted, overIcon, target, editing])

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [armed])

  // Pin just outside the sphere's top-left (45° up-left, clear of its outline), every frame.
  useEffect(() => {
    if (!target) return
    let frame = 0
    const tick = () => {
      const el = ref.current, a = screenAnchors.get(target)
      if (el && a) {
        const edge = (a.r + TRASH_GAP_PX + TRASH_PX / 2) * Math.SQRT1_2
        el.style.transform = `translate(${Math.round(a.x - edge - TRASH_PX / 2)}px, ${Math.round(a.y - edge - TRASH_PX / 2)}px)`
        el.style.visibility = a.visible ? 'visible' : 'hidden'
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [target])

  if (!target) return null
  const onClick = () => {
    if (!armed) return setArmed(true)
    const v = useView.getState()
    if (v.openId === target || v.selectedId === target) close()
    if (v.hoveredId === target) v.setHovered(null)
    removeFromBoard(target)
    setTarget(null); setArmed(false); setOverIcon(false)
  }

  return <button
    ref={ref}
    className={`staged-trash${armed ? ' armed' : ''}${leaving ? ' leaving' : ''}`}
    onClick={onClick}
    onPointerEnter={() => setOverIcon(true)}
    onPointerLeave={() => setOverIcon(false)}
    aria-label={armed ? 'Click again to remove' : 'Remove'}
    title={armed ? 'Click again to remove' : 'Remove'}
  >
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 4h11" />
      <path d="M6 4V2.5h4V4" />
      <path d="M3.8 4l.7 9.5h7l.7-9.5" />
      <path d="M6.6 6.5v4.5M9.4 6.5v4.5" />
    </svg>
  </button>
}
