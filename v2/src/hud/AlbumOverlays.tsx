import { useEffect, useMemo, useRef, useState } from 'react'
import { liveScores, screenAnchors, useView } from '../scene/view'
import { addedColumn, find, formatScore, rating as ratingOf, songTier, stagedAlbums, tracksOf, treeNodes } from '../state/board'
import { usePersisted, useStore } from '../state/store'
import { AlbumChart } from './AlbumChart'
import { formatDuration, loadAlbumDetails, needsTracklist, useAlbumLoads } from './albumDetails'
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
        const hw = a.halfWidth ?? a.r, right = a.x + hw + GAP_PX, left = a.x - hw - GAP_PX - w
        let x: number, y: number
        if (right + w <= vw - EDGE_PX || left >= EDGE_PX) {
          el.style.maxHeight = ''
          const h = el.offsetHeight
          x = (a.preferLeft ? left < EDGE_PX : right + w <= vw - EDGE_PX) ? right : left
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

/**
 * Hover card for anything on the open tree, with its score: a track's, movie's or book's own (UNRATED until it's
 * dragged), or an album's or artist's, worked out from their tracks. Albums show artist, album and year; tracks
 * show track, artist and album; artists their name. Hidden while that thing's popup is open (the popup shows the
 * same) and while dragging (the drag readout shows the score).
 */
export const ItemHoverCard = () => {
  const hoveredId = useView(v => v.hoveredId)
  const openId = useView(v => v.openId)
  const draggingId = useView(v => v.draggingId)
  const s = usePersisted()
  const ref = useRef<HTMLDivElement>(null)
  const f = find(s, hoveredId)
  const id = f && hoveredId !== openId && !draggingId ? hoveredId : null
  usePinned(id, ref, 'centre')
  if (!f || !id) return null

  const rating = ratingOf(s, id)
  const artistName = (artistId?: string) => artistId ? s.artists[artistId]?.name : undefined
  return <div ref={ref} className="album-card" role="tooltip">
    {f.collection === 'albums'
      ? <AlbumFacts artist={artistName(f.entity.artistId)} album={f.entity.name} year={f.entity.year} rating={rating} />
      : <dl className="album-facts">
          <dt>{f.collection === 'tracks' ? 'TRACK' : f.collection === 'artists' ? 'ARTIST' : 'NAME'}</dt><dd>{f.entity.name}</dd>
          {f.collection === 'tracks' && <>
            <dt>ARTIST</dt><dd>{artistName(f.entity.artistId) ?? '—'}</dd>
            <dt>ALBUM</dt><dd>{f.entity.albumId ? s.albums[f.entity.albumId]?.name ?? '—' : '—'}</dd>
          </>}
          <dt>SCORE</dt><RatingValue rating={rating} />
        </dl>}
  </div>
}

/** Live score above the fruit being dragged, so you can see exactly where it will land; on MUSIC, with its song tier
 * in the tier's v1 colour. */
export const DragScore = () => {
  const draggingId = useView(v => v.draggingId)
  const music = useStore(s => s.activeType) === 'music'
  const ref = useRef<HTMLDivElement>(null), value = useRef<HTMLSpanElement>(null), tier = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!draggingId) return
    let frame = 0, shown = ''
    const tick = () => {
      const el = ref.current, a = screenAnchors.get(draggingId), score = liveScores.get(draggingId)
      if (el && a && score !== undefined) {
        const t = songTier(score), text = `${formatScore(score)}|${t.name}`
        if (text !== shown) {
          shown = text
          value.current!.textContent = formatScore(score)
          if (tier.current) { tier.current.textContent = t.name; tier.current.style.background = t.color }
        }
        el.style.transform = `translate(${Math.round(a.x)}px, ${Math.round(a.y - a.r - 10)}px) translate(-50%, -100%)`
        el.style.visibility = 'visible'
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [draggingId])
  if (!draggingId) return null
  return <div ref={ref} className="drag-score" aria-live="polite">
    <span ref={value} />
    {music && <span ref={tier} className="tier-chip" />}
  </div>
}

type Rating = ReturnType<typeof ratingOf>

/** A score with its tier beside it, in the tier's v1 colour (no tier when unrated, or on movies and books). */
const RatingValue = ({ rating, className = 'album-score' }: { rating: Rating, className?: string }) =>
  <dd className={rating.label === 'UNRATED' ? 'dim' : className}>
    {rating.label}
    {rating.tier && <span className="tier-chip" style={{ background: rating.tier.color }}>{rating.tier.name}</span>}
  </dd>

const AlbumFacts = ({ artist, album, year, rating }: { artist?: string, album: string, year?: number, rating: Rating }) =>
  <dl className="album-facts">
    <dt>ARTIST</dt><dd>{artist ?? '—'}</dd>
    <dt>ALBUM</dt><dd>{album}</dd>
    <dt>YEAR</dt><dd>{year ?? '—'}</dd>
    <dt>RATING</dt><RatingValue rating={rating} />
  </dl>

/** A track in the popup (or being edited): its id, name, and what's shown beside it. */
type DraftTrack = { id: string, name: string, disc: number, number: number, durationMs?: number, score?: number }
type Draft = { name: string, year: string, tracks: DraftTrack[] }

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
export const AlbumPopup = ({ docked }: { docked?: string } = {}) => {
  // Docked (album view): always this album, under its title in the HUD instead of pinned beside it; its × and Esc
  // leave album view.
  const pinnedId = useView(v => v.openId)
  const openId = docked ?? pinnedId
  const closePinned = useView(v => v.close)
  const close = docked ? () => useView.getState().setAlbumView(null) : closePinned
  const setEditing = useView(v => v.setEditing)
  const s = usePersisted()
  // The popup is for albums; anything else that's "open" (a tapped artist, say) has no popup.
  const item = openId ? s.albums[openId] : undefined
  const artistName = item?.artistId ? s.artists[item.artistId]?.name : undefined
  const rating = openId ? ratingOf(s, openId) : { label: '' }
  const editAlbum = useStore(st => st.editAlbum)
  const status = useAlbumLoads(s => openId ? s.status[openId] : undefined)
  const ref = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  usePinned(item && !docked ? openId : null, ref, 'top')

  // Fresh state for each album opened.
  useEffect(() => { setDraft(null) }, [openId])
  useEffect(() => { setEditing(draft !== null) }, [draft, setEditing])
  useEffect(() => { if (openId) void loadAlbumDetails(openId) }, [openId])
  useEffect(() => {
    if (!openId) return
    // Esc leaves edit mode first, then closes. (Docked, album view's own Esc does the closing.)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (draft) setDraft(null); else if (!docked) close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, close, draft, docked])

  if (!item || !openId) return null
  const year0 = item.year
  const tracks: DraftTrack[] = tracksOf(s, openId).map(t => ({
    id: t.id, name: t.name, disc: t.disc ?? 0, number: t.number ?? 0, durationMs: t.durationMs, score: t.score,
  }))

  const startEdit = () => { setDraft({ name: item.name, year: year0?.toString() ?? '', tracks }) }
  const year = draft ? parseYear(draft.year) : null
  const problem = !draft ? null
    : !draft.name.trim() ? 'The title can\'t be empty.'
    : year === 'invalid' ? 'The year should be four digits, or blank.'
    : draft.tracks.some(t => !t.name.trim()) ? 'Track names can\'t be empty.'
    : null
  const save = () => {
    if (!draft || problem || year === 'invalid') return
    if (editAlbum(openId, { name: draft.name, year, tracks: draft.tracks.map(t => ({ id: t.id, name: t.name })) })) setDraft(null)
  }

  const shown = draft ? draft.tracks : tracks
  const multiDisc = new Set(shown.map(t => t.disc)).size > 1
  const setTrackName = (id: string, name: string) => draft && setDraft({ ...draft, tracks: draft.tracks.map(t => t.id === id ? { ...t, name } : t) })
  const deleteTrack = (id: string) => draft && setDraft({ ...draft, tracks: draft.tracks.filter(t => t.id !== id) })

  return <div ref={ref} className={`album-popup${draft ? ' album-popup-editing' : ''}${docked ? ' album-popup-docked' : ''}`}
    role={docked ? 'region' : 'dialog'} aria-label={`${item.name} tracklist`}>
    {!docked && <button className="album-popup-close" onClick={close} aria-label="Close">×</button>}
    {draft
      ? <>
          <input className="album-input album-input-title" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} aria-label="Title" autoFocus />
          <dl className="album-facts">
            <dt>ARTIST</dt><dd>{artistName ?? '—'}</dd>
            <dt>YEAR</dt>
            <dd><input className="album-input album-input-year" value={draft.year} onChange={e => setDraft({ ...draft, year: e.target.value })} inputMode="numeric" maxLength={4} placeholder="—" aria-label="Year" /></dd>
            <dt>RATING</dt><RatingValue rating={rating} className="" />
          </dl>
        </>
      : !docked && <>
          <div className="album-popup-title">{item.name}</div>
          <AlbumFacts artist={artistName} album={item.name} year={year0} rating={rating} />
        </>}
    {(!docked || draft) && <div className="album-popup-divider" />}
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
                : <span className="album-track-time">
                    {t.score !== undefined && <span className="album-track-score">{formatScore(t.score)}</span>}
                    {t.durationMs !== undefined ? formatDuration(t.durationMs) : ''}
                    {/* Album view: each song's tier, in its colour. */}
                    {docked && t.score !== undefined && (() => {
                      const tier = songTier(t.score)
                      return <span className="album-track-tier" style={{ background: tier.color }}>{tier.name}</span>
                    })()}
                  </span>}
            </li>
          })}
        </ol>
      : <div className="album-popup-hint">{
          draft ? 'No tracks.'
          : status === 'error' ? 'Tracklist unavailable right now.'
          : status === 'loading' || needsTracklist(openId) ? 'Loading tracklist…'
          : 'No tracks.'}</div>}
    {docked && !draft && shown.length > 0 && <AlbumChart tracks={shown} />}
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
/** Grace period after the pointer leaves the sphere, so it can travel onto an icon. */
const HIDE_DELAY_MS = 350
/** Fade-out time; keep in step with `.sphere-icon.leaving` in albumOverlays.css (fade-in is 0.6s, CSS only). */
const FADE_OUT_MS = 200
const ICON_PX = 26
/** Clear gap between the sphere's outline and an icon. */
const ICON_GAP_PX = 4

/**
 * Shared behaviour for the small action icons on a sphere's corners: follow the item that's hovered (or open, or
 * selected on touch screens), stay while the pointer travels onto the icon, fade out when it's left, hide while
 * editing, and stay pinned just outside the sphere's top-left or top-right every frame.
 */
const useSphereIcon = (eligibleIds: string[], corner: 'top-left' | 'top-right') => {
  const hoveredId = useView(v => v.hoveredId)
  const openId = useView(v => v.openId)
  const selectedId = useView(v => v.selectedId)
  const editing = useView(v => v.editing)
  const draggingId = useView(v => v.draggingId)
  const albumView = useView(v => v.albumView)
  const [target, setTarget] = useState<string | null>(null)
  /** Fading out: still on screen, on its way to being removed. */
  const [leaving, setLeaving] = useState(false)
  const [overIcon, setOverIcon] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)
  const key = eligibleIds.join(',')
  const hidden = editing || draggingId !== null
  // In album view the album's own icons stay up (on its row in the catalog).
  const wanted = hidden ? null : [hoveredId, openId, selectedId, albumView].find(id => id && eligibleIds.includes(id)) ?? null

  useEffect(() => {
    if (wanted) {
      setLeaving(false)
      if (wanted !== target) setTarget(wanted)
      return
    }
    if (!target) { setLeaving(false); return }
    // Editing or dragging hides it straight away; otherwise give the pointer a moment to reach the icon.
    const delay = hidden ? 0 : HIDE_DELAY_MS
    if (overIcon && !hidden && key.split(',').includes(target)) { setLeaving(false); return }
    const fade = setTimeout(() => setLeaving(true), delay)
    const gone = setTimeout(() => { setTarget(null); setLeaving(false); setOverIcon(false) }, delay + FADE_OUT_MS)
    return () => { clearTimeout(fade); clearTimeout(gone) }
  }, [wanted, overIcon, target, hidden, key])

  // Pin just outside the sphere's corner (45° up, clear of its outline), every frame.
  useEffect(() => {
    if (!target) return
    let frame = 0
    const tick = () => {
      const el = ref.current, a = screenAnchors.get(target)
      if (el && a) {
        const d = (a.r + ICON_GAP_PX + ICON_PX / 2) * Math.SQRT1_2
        const x = corner === 'top-left' ? a.x - d : a.x + d
        el.style.transform = `translate(${Math.round(x - ICON_PX / 2)}px, ${Math.round(a.y - d - ICON_PX / 2)}px)`
        el.style.visibility = a.visible ? 'visible' : 'hidden'
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [target, corner])

  const hide = () => { setTarget(null); setLeaving(false); setOverIcon(false) }
  const pointer = { onPointerEnter: () => setOverIcon(true), onPointerLeave: () => setOverIcon(false) }
  return { target, leaving, ref, pointer, hide }
}

/**
 * Trash icon just outside the top-left of a sphere: fruit on the tree (a track is hidden, keeping its score; a
 * movie or book is deleted) and albums, staged or added (deleted with their tracks). Artists have none: they're
 * worked out from their albums. First click arms it (red), a second click within a few seconds removes.
 */
export const ItemTrash = () => {
  const close = useView(v => v.close)
  const s = usePersisted()
  const activeType = useStore(st => st.activeType)
  const ids = useMemo(() => !activeType ? [] : [
    ...treeNodes(s, activeType).map(n => n.id),
    ...(activeType === 'music' ? [...stagedAlbums(s).map(a => a.id), ...addedColumn(s).filter(x => x.collection === 'albums').map(x => x.id)] : []),
  ], [s, activeType])
  const remove = useStore(st => st.remove)
  const icon = useSphereIcon(ids, 'top-left')
  const [armed, setArmed] = useState(false)

  useEffect(() => { setArmed(false) }, [icon.target])
  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [armed])

  const target = icon.target
  if (!target) return null
  const onClick = () => {
    if (!armed) return setArmed(true)
    const v = useView.getState()
    if (v.openId === target || v.selectedId === target) close()
    if (v.hoveredId === target) v.setHovered(null)
    remove(target)
    icon.hide(); setArmed(false)
  }

  return <button
    ref={icon.ref}
    className={`sphere-icon sphere-icon-trash${armed ? ' armed' : ''}${icon.leaving ? ' leaving' : ''}`}
    onClick={onClick}
    {...icon.pointer}
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
