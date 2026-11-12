import { useEffect, useRef, useState } from 'react'
import { nodeKey } from '../scene/Board'
import { liveScores, screenAnchors, useView } from '../scene/view'
import { find, formatScore, INCOMPLETE, rating as ratingOf, songTier, tracksOf } from '../state/board'
import { matchArtist, usePersisted, useStore } from '../state/store'
import { findArtists, loadArtists } from '../state/remote'
import { SHORT_TITLE_MAX, shortTitle } from '../shared/names'
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
/**
 * Pins `ref` beside the thing `id` names, every frame. `keys`: where to look for it on screen, first found wins
 * (default: its own id, as fruit and catalog rows publish it).
 */
const usePinned = (id: string | null, ref: React.RefObject<HTMLElement | null>, keys?: (id: string) => string[]) => {
  useEffect(() => {
    if (!id) return
    let frame = 0
    const tick = () => {
      const el = ref.current
      const a = (keys ? keys(id) : [id]).map(k => screenAnchors.get(k)).find(Boolean)
      if (el && a) {
        const w = el.offsetWidth
        const vw = window.innerWidth, vh = window.innerHeight
        const hw = a.halfWidth ?? a.r, right = a.x + hw + GAP_PX, left = a.x - hw - GAP_PX - w
        let x: number, y: number
        if (right + w <= vw - EDGE_PX || left >= EDGE_PX) {
          el.style.maxHeight = ''
          const h = el.offsetHeight
          x = (a.preferLeft ? left < EDGE_PX : right + w <= vw - EDGE_PX) ? right : left
          y = Math.min(Math.max(EDGE_PX, a.y - h / 2), vh - h - EDGE_PX)
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
  }, [id, ref, keys])
}

/**
 * Where the hover card looks for what's hovered: an artist or album on the read-only rater first (nodeKey: their
 * plain ids are the catalog's rows), then the plain id (songs, movies, books).
 */
const hoverKeys = (id: string) => [nodeKey(id), id]

/**
 * Hover card for anything on the open tree, with its score: a track's, movie's or book's own (UNRATED until it's
 * dragged), or an album's or artist's, worked out from their tracks. Albums show artist, album and year; tracks
 * show track, artist and album; artists their name. Hidden while that thing's popup is open (the popup shows the
 * same) and while dragging (the drag readout shows the score).
 */
export const ItemHoverCard = () => {
  const hoveredId = useView(v => v.hoveredId)
  const draggingId = useView(v => v.draggingId)
  const s = usePersisted()
  const ref = useRef<HTMLDivElement>(null)
  const f = find(s, hoveredId)
  const id = f && !draggingId ? hoveredId : null
  usePinned(id, ref, hoverKeys)
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
  <dd className={rating.label === 'UNRATED' || rating.label === INCOMPLETE ? 'dim' : className}>
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
type DraftTrack = { id: string, name: string, /** what the rater shows for it; blank: its full name */ shortTitle: string, disc: number, number: number, durationMs?: number, score?: number, notASong: boolean, live: boolean }
/** `artistText`: the artist's name as typed; `artistId`: the artist picked from the options (null: a name typed, matched or made on SAVE). */
type Draft = { name: string, year: string, artistText: string, artistId: string | null, tracks: DraftTrack[] }

/** Whole years between 1000 and 2999, or blank for "no year". */
const parseYear = (text: string): number | null | 'invalid' => {
  const t = text.trim()
  if (t === '') return null
  return /^[12]\d{3}$/.test(t) ? Number(t) : 'invalid'
}

/**
 * The album's details in album view (hud/AlbumView.tsx), docked under its title: the tracklist with each song's tier
 * chip, and the FLOW chart. Loads the tracklist if it isn't there yet (e.g. albums staged before tracklists existed).
 *
 * EDIT turns the title, year and track names into fields and lets tracks be deleted; nothing changes until SAVE
 * (CANCEL or Esc throws the draft away).
 */
export const AlbumPopup = ({ docked, actions }: { docked: string, actions?: React.ReactNode }) => {
  const openId: string | null = docked
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
  // Misc only: a song being typed onto the end of it (null: the row isn't open).
  const [adding, setAdding] = useState<string | null>(null)
  const [addProblem, setAddProblem] = useState<string | null>(null)
  const addTypedSong = useStore(st => st.addTypedSong)

  // Fresh state for each album opened.
  useEffect(() => { setDraft(null); setAdding(null); setAddProblem(null) }, [openId])
  // Editing while this one has a draft (compare shows two of these, so each only answers for its own).
  const drafting = draft !== null
  useEffect(() => { if (!drafting) return; setEditing(true); return () => setEditing(false) }, [drafting, setEditing])
  useEffect(() => { if (openId) void loadAlbumDetails(openId) }, [openId])
  useEffect(() => {
    if (!openId) return
    // Esc leaves edit mode (album view's own Esc does the rest).
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && draft) setDraft(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, draft])

  if (!item || !openId) return null
  const year0 = item.year
  const tracks: DraftTrack[] = tracksOf(s, openId).map(t => ({
    id: t.id, name: t.name, shortTitle: t.shortTitle ?? '', disc: t.disc ?? 0, number: t.number ?? 0, durationMs: t.durationMs, score: t.score, notASong: !!t.notASong, live: !!t.live,
  }))

  const startEdit = () => { setDraft({ name: item.name, year: year0?.toString() ?? '', artistText: artistName ?? '', artistId: item.artistId ?? null, tracks }) }
  const year = draft ? parseYear(draft.year) : null
  const problem = !draft ? null
    : !draft.name.trim() ? 'The title can\'t be empty.'
    : year === 'invalid' ? 'The year should be four digits, or blank.'
    : item.artistId && !draft.artistText.trim() ? 'The artist can\'t be empty.'
    : draft.tracks.some(t => !t.name.trim()) ? 'Track names can\'t be empty.'
    : null
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!draft || problem || year === 'invalid' || saving) return
    if (!editAlbum(openId, { name: draft.name, year, tracks: draft.tracks.map(t => ({ id: t.id, name: t.name, shortTitle: t.shortTitle, notASong: t.notASong, live: t.live })) })) return
    // Another artist: picked, or typed (one here by that name, loaded or not, else a new one). Their albums load first.
    const text = draft.artistText.trim().replace(/\s+/g, ' ')
    const moved = draft.artistId ? draft.artistId !== item.artistId : !!text && text.toLowerCase() !== (artistName ?? '').toLowerCase()
    if (moved) {
      setSaving(true)
      try {
        let to: { id: string } | { name: string } = draft.artistId ? { id: draft.artistId } : { name: text }
        if (!draft.artistId) {
          await findArtists({ names: [text] })
          const found = matchArtist(useStore.getState().artists, { name: text })
          if (found) to = { id: found.id }
        }
        if ('id' in to) await loadArtists([to.id])
        const landed = useStore.getState().moveAlbum(openId, to)
        // Singles moved to an artist with Singles of their own joins theirs: album view follows.
        if (landed && landed !== openId) useView.getState().setAlbumView(landed)
      } finally { setSaving(false) }
    }
    setDraft(null)
  }

  const shown = draft ? draft.tracks : tracks
  const multiDisc = new Set(shown.map(t => t.disc)).size > 1
  // The short title follows the name while it's still the one worked out from it (or blank).
  const setTrackName = (id: string, name: string) => draft && setDraft({ ...draft, tracks: draft.tracks.map(t => t.id !== id ? t
    : { ...t, name, shortTitle: !t.shortTitle.trim() || t.shortTitle === shortTitle(t.name) ? shortTitle(name) : t.shortTitle }) })
  const setTrackShort = (id: string, short: string) => draft && setDraft({ ...draft, tracks: draft.tracks.map(t => t.id === id ? { ...t, shortTitle: short } : t) })
  const toggleSong = (id: string) => draft && setDraft({ ...draft, tracks: draft.tracks.map(t => t.id === id ? { ...t, notASong: !t.notASong } : t) })
  const toggleLive = (id: string) => draft && setDraft({ ...draft, tracks: draft.tracks.map(t => t.id === id ? { ...t, live: !t.live } : t) })
  // Every track live, or none if they all are already (a live album's original songs are then unticked one by one).
  const allLive = !!draft && draft.tracks.length > 0 && draft.tracks.every(t => t.live)
  const setAllLive = () => draft && setDraft({ ...draft, tracks: draft.tracks.map(t => ({ ...t, live: !allLive })) })
  const deleteTrack = (id: string) => draft && setDraft({ ...draft, tracks: draft.tracks.filter(t => t.id !== id) })
  // A song typed onto any album with an artist goes on the tree unrated, after its last track, like any other
  // (store.addTypedSong); the row stays open for the next.
  const addSong = () => {
    const name = adding?.trim()
    if (!name || !item.artistId) return
    if (addTypedSong({ name, artist: { id: item.artistId }, album: { id: openId } })) { setAdding(''); setAddProblem(null) }
    else setAddProblem(`${item.name} already has “${name}”.`)
  }
  const stopAdding = () => { setAdding(null); setAddProblem(null) }

  return <div ref={ref} className={`album-popup album-popup-docked${draft ? ' album-popup-editing' : ''}`}
    role="region" aria-label={`${item.name} tracklist`}>
    {draft
      ? <>
          <input className="album-input album-input-title" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} aria-label="Title" autoFocus />
          <dl className="album-facts">
            <dt>ARTIST</dt>
            <dd><ArtistField text={draft.artistText} picked={draft.artistId} onChange={(artistText, artistId) => setDraft({ ...draft, artistText, artistId })} /></dd>
            <dt>YEAR</dt>
            <dd><input className="album-input album-input-year" value={draft.year} onChange={e => setDraft({ ...draft, year: e.target.value })} inputMode="numeric" maxLength={4} placeholder="—" aria-label="Year" /></dd>
            <dt>RATING</dt><RatingValue rating={rating} className="" />
          </dl>
        </>
      : null}
    {draft && <div className="album-popup-divider" />}
    {shown.length > 0 || adding !== null
      ? <ol className="album-tracks">
          {shown.map((t, i) => {
            // In edit mode, show the numbering the tracks will have after saving.
            const number = draft ? shown.slice(0, i + 1).filter(x => x.disc === t.disc).length : t.number
            return <li key={t.id} className={`album-track${t.notASong ? ' not-a-song' : ''}`}>
              {multiDisc && (i === 0 || shown[i - 1].disc !== t.disc) && <div className="album-disc">DISC {t.disc}</div>}
              <span className="album-track-no">{String(number).padStart(2, '0')}</span>
              {draft
                ? <span className="album-track-fields">
                    <input className="album-input album-input-track" value={t.name} onChange={e => setTrackName(t.id, e.target.value)} aria-label={`Track ${number} name`} />
                    <input className="album-input album-input-short" value={t.shortTitle} onChange={e => setTrackShort(t.id, e.target.value)}
                      maxLength={SHORT_TITLE_MAX} placeholder="—" aria-label={`Track ${number} short title`} />
                  </span>
                : <span className="album-track-name">{t.name}{t.live && <span className="album-track-live">LIVE</span>}</span>}
              {draft
                ? <span className="album-track-edit">
                    {/* Live: a song they already have, recorded live; counts for the album, not the artist. */}
                    <button className={`album-track-live-toggle${t.live ? ' on' : ''}`} onClick={() => toggleLive(t.id)} aria-pressed={t.live}
                      aria-label={`${t.name}: live`} title={t.live ? 'Live: not counted for the artist' : 'Not live'}>LIVE</button>
                    {/* Not a song (a skit, an interlude…): off the rater, counted for nothing. */}
                    <button className={`album-track-song${t.notASong ? ' off' : ''}`} onClick={() => toggleSong(t.id)} aria-pressed={!t.notASong}
                      aria-label={`${t.name}: ${t.notASong ? 'not a song' : 'a song'}`} title={t.notASong ? 'Not a song' : 'A song'}>{t.notASong ? 'NOT A SONG' : 'SONG'}</button>
                    <button className="album-track-delete" onClick={() => deleteTrack(t.id)} aria-label={`Delete ${t.name}`}>×</button>
                  </span>
                : <span className="album-track-time">
                    {t.score !== undefined && !t.notASong && <span className="album-track-score">{formatScore(t.score)}</span>}
                    {t.durationMs !== undefined ? formatDuration(t.durationMs) : ''}
                    {t.notASong && <span className="album-track-tier album-track-nonsong">NOT A SONG</span>}
                    {/* Album view: each song's tier, in its colour. */}
                    {t.score !== undefined && !t.notASong && (() => {
                      const tier = songTier(t.score)
                      return <span className="album-track-tier" style={{ background: tier.color }}>{tier.name}</span>
                    })()}
                  </span>}
            </li>
          })}
          {adding !== null && !draft && <li className="album-track album-track-adding">
            <span className="album-track-no">{String(Math.max(0, ...shown.map(t => t.number)) + 1).padStart(2, '0')}</span>
            <input className="album-input album-input-track" value={adding} placeholder="Song" autoFocus aria-label={`New song on ${item.name}`}
              onChange={e => { setAdding(e.target.value); setAddProblem(null) }}
              onKeyDown={e => {
                // Its keys stay here: Esc closes the row, not album view.
                e.stopPropagation()
                if (e.key === 'Enter') { e.preventDefault(); addSong() }
                if (e.key === 'Escape') { e.preventDefault(); stopAdding() }
              }}
              onBlur={() => { if (!adding.trim()) stopAdding() }} />
          </li>}
        </ol>
      : <div className="album-popup-hint">{
          draft ? 'No tracks.'
          : status === 'error' ? 'Tracklist unavailable right now.'
          : status === 'loading' || needsTracklist(openId) ? 'Loading tracklist…'
          : 'No tracks.'}</div>}
    {!draft && shown.length > 0 && !item?.misc && <AlbumChart tracks={shown} />}
    {(problem ?? addProblem) && <div className="album-popup-problem" role="alert">{problem ?? addProblem}</div>}
    <div className="album-popup-actions">
      {draft
        ? <>
            <button className="album-action" onClick={setAllLive} aria-pressed={allLive}>{allLive ? 'NONE LIVE' : 'ALL LIVE'}</button>
            <button className="album-action" onClick={() => setDraft(null)}>CANCEL</button>
            <button className="album-action album-action-primary" onClick={() => void save()} disabled={!!problem || saving}>SAVE</button>
          </>
        : <>
            {item.artistId && (adding === null
              ? <button className="album-action" onClick={() => setAdding('')}>ADD SONG</button>
              : <button className="album-action album-action-primary" onMouseDown={e => e.preventDefault()} onClick={addSong} disabled={!adding.trim()}>ADD</button>)}
            <button className="album-action" onClick={() => { stopAdding(); startEdit() }}>EDIT</button>
            {actions}
          </>}
    </div>
  </div>
}

/** Most artists offered under the artist field. */
const ARTIST_OPTIONS = 5

/**
 * EDIT's artist field: type a name; artists whose name has it in them are offered under it (ones not loaded yet are
 * looked up too), and a click picks one. A name not picked is matched to the artist by that name on SAVE, or makes a
 * new one (NEW).
 */
const ArtistField = ({ text, picked, onChange }: { text: string, picked: string | null, onChange: (text: string, id: string | null) => void }) => {
  const artists = useStore(st => st.artists)
  const [focused, setFocused] = useState(false)
  const q = text.trim().toLowerCase()
  useEffect(() => {
    if (picked || q.length < 2) return
    const t = setTimeout(() => void findArtists({ q }), 200)
    return () => clearTimeout(t)
  }, [q, picked])
  const all = Object.values(artists)
  const options = picked || !q ? [] : all.filter(a => a.name.toLowerCase().includes(q))
    .sort((a, b) => Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q)) || a.name.localeCompare(b.name))
    .slice(0, ARTIST_OPTIONS)
  const isNew = !picked && !!q && !all.some(a => a.name.toLowerCase() === q)
  return <div className="album-artist-field">
    <span className="album-artist-input">
      <input className="album-input" value={text} aria-label="Artist" autoComplete="off"
        onChange={e => onChange(e.target.value, null)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onKeyDown={e => { if (e.key === 'Enter' && options[0]) { e.preventDefault(); onChange(options[0].name, options[0].id) } }} />
      {isNew && <span className="album-artist-new">NEW</span>}
    </span>
    {focused && options.length > 0 && <ul className="album-artist-options" aria-label="Artists">
      {options.map(a => <li key={a.id}>
        <button type="button" className="album-artist-option" onMouseDown={e => e.preventDefault()} onClick={() => onChange(a.name, a.id)}>
          {a.image ? <img src={a.image} alt="" /> : <span className="album-artist-blank" />}
          <span>{a.name}</span>
        </button>
      </li>)}
    </ul>}
  </div>
}
