import { useEffect, useMemo, useRef, useState } from 'react'
import { albumCover } from '../scene/cover'
import { artistView, RATING_FADE, ratingFocus, screenAnchors, sidePanel, useView, isComparing } from '../scene/view'
import { albumsOf, artistScoreOf, firstOnTree, INCOMPLETE, isLoaded, rating, tracksOf } from '../state/board'
import { loadArtists, loadMoreArtists, useArtistPages } from '../state/remote'
import { shownAlbumScore } from '../state/scores'
import { usePersisted, useStore } from '../state/store'
import { addStagedAlbum } from './albumDetails'
import './catalog.css'

type Row = {
  id: string, name: string, image?: string, year?: number, score?: number
  /** In the staging tray: none of its tracks are on the tree yet. */
  staged?: boolean
  /** The artist's Misc album: no score or grade, always last. */
  misc?: boolean
  /** The score as shown, its letter grade and that grade's colour (v1's), if it has a score yet. Artists and albums show both. */
  label?: string, color?: string, grade?: string
  /** Albums: some of its songs are still unrated, so no score or grade yet. */
  incomplete?: boolean
}
type Order = 'year' | 'score'

/** Albums by year (oldest first) or by score (best first); those without one go last, in the order they went on. */
const byOrder = (order: Order) => (a: Row, b: Row) => {
  if (a.misc || b.misc) return (a.misc ? 1 : 0) - (b.misc ? 1 : 0)
  const x = order === 'year' ? a.year : a.score, y = order === 'year' ? b.year : b.score
  if (x === undefined || y === undefined) return (x === undefined ? 1 : 0) - (y === undefined ? 1 : 0)
  return order === 'year' ? x - y : y - x
}
type Group = {
  artist?: Row, albums: Row[]
  /** Not loaded yet: their albums load when the arrow opens them (or their box is clicked); `onTree`, whether any is on the tree. */
  pending?: { onTree: boolean }
}

/**
 * The catalog (MUSIC): every artist and album in the database, on the tree or not, in the left-hand sidebar under the
 * + key. Artists go best first (by artist score), unrated ones after.
 * - click an album on the tree for album view (view.albumView, hud/AlbumView.tsx): every other album draws back into
 *   the spine and its title and details fill the left half of the screen (the rater slides right to make room). Another album switches to that one; clicking it
 *   again, a click on empty space (with nothing open) or Esc leaves album view.
 * - click a staged album (dim, no score yet) to put its tracks on the tree, unrated, and open album view on it.
 * Each artist and album shows its score and letter grade (v1's grades), the letter on a chip in the grade's colour.
 * Left of each row, a box puts the artist (all their albums on the tree) or the album on the rater or takes it off for
 * now (view.hiddenAlbums; not saved): ticked when on, a dash when only some of an artist's
 * are. A staged album's box (always empty) puts its tracks on the tree, unrated, and opens album view on it, where they
 * get rated (albumDetails.addStagedAlbum).
 * Click an artist for their overview (artist view, hud/ArtistView.tsx; again to close it); the arrow at the end of the
 * row opens and closes their albums, which start closed; albums go by year or by score (the switch at the top).
 * No hover behaviour (for now). Each thumbnail of something on the tree publishes its place on screen (screenAnchors),
 * so the popup (to the right of the row) and its trash icon pin to it. In active rating, the rows not being rated fade.
 */
export const Catalog = () => {
  const s = usePersisted()
  const [order, setOrder] = useState<Order>('year')
  // Every artist starts collapsed; click one to open it.
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const toggle = (id: string) => setOpen(c => { const n = new Set(c); if (!n.delete(id)) n.add(id); return n })
  // Opening an artist loads their albums, if they aren't here yet.
  useEffect(() => { if (open.size) void loadArtists(open) }, [open])
  const groups = useMemo(() => {
    const albumRow = (a: (typeof s.albums)[string]): Row => {
      const score = shownAlbumScore(tracksOf(s, a.id)), r = rating(s, a.id)
      return { id: a.id, name: a.name, image: albumCover(a), year: a.year, score, staged: a.addedAt === undefined, misc: !!a.misc,
        ...(r.tier ? { label: r.label, color: r.tier.color, grade: r.tier.name } : {}), incomplete: r.label === INCOMPLETE }
    }
    // Every artist, loaded or not (one just added has no albums yet); then albums with no artist, if any.
    const byArtist: Group[] = Object.values(s.artists).map(artist => {
      const r = rating(s, artist.id)
      return {
        artist: { id: artist.id, name: artist.name, image: artist.image, score: artistScoreOf(s, artist.id),
          ...(r.tier ? { label: r.label, color: r.tier.color, grade: r.tier.name } : {}) },
        albums: albumsOf(s, artist.id).map(albumRow).sort(byOrder(order)),
        ...(isLoaded(s, artist.id) ? {} : { pending: { onTree: firstOnTree(s, artist.id) !== undefined } }),
      }
    })
    // Artists best first, by artist score; unrated ones after them (by name), and albums with no artist last.
    byArtist.sort((a, b) => (a.artist!.score === undefined ? 1 : 0) - (b.artist!.score === undefined ? 1 : 0)
      || (b.artist!.score ?? 0) - (a.artist!.score ?? 0) || a.artist!.name.localeCompare(b.artist!.name))
    const loose = Object.values(s.albums).filter(a => !a.artistId || !s.artists[a.artistId]).sort((a, b) => a.stagedAt - b.stagedAt)
    return loose.length ? [...byArtist, { albums: loose.map(albumRow).sort(byOrder(order)) }] : byArtist
  }, [s, order])

  const rows = useRef(new Map<string, { row: HTMLElement, thumb: HTMLElement }>())
  const shown = (g: Group) => !g.artist || open.has(g.artist.id)
  const ids = groups.flatMap(g => [...(g.artist ? [g.artist.id] : []), ...(shown(g) ? g.albums.map(a => a.id) : [])])
  const key = ids.join(',')

  // Every frame: publish each row's place, fade what isn't being rated.
  useEffect(() => {
    let frame = 0
    const tick = () => {
      const focus = ratingFocus.ids
      for (const [id, { row, thumb }] of rows.current) {
        // The cover (the trash icon pins to it), as wide as the row, so the popup opens right of the row, not over it.
        const r = thumb.getBoundingClientRect(), w = row.getBoundingClientRect(), x = r.left + r.width / 2
        screenAnchors.set(id, { x, y: r.top + r.height / 2, r: r.width / 2, visible: r.height > 0, halfWidth: Math.max(r.width / 2, w.right - x) })
        row.style.opacity = focus && !focus.has(id) ? String(1 - RATING_FADE) : ''
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    const shown = key.split(',')
    return () => { cancelAnimationFrame(frame); for (const id of shown) screenAnchors.delete(id) }
  }, [key])

  const bind = (id: string) => (row: HTMLElement | null) => {
    if (row) rows.current.set(id, { row, thumb: row.querySelector('.catalog-thumb') as HTMLElement })
    else rows.current.delete(id)
  }
  // An artist's row opens their overview (artist view), or closes it if it's open; phones, with no room for the arrow
  // or the overview's sections, open and close the artist's albums instead.
  const onArtist = (id: string) => {
    if (window.innerWidth <= 640) return toggle(id)
    const v = useView.getState()
    if (artistView(v) === id) return v.setDrill(null)
    v.setAlbumView(null); v.setSplit(false); v.setDrill(id)
  }
  const onAlbum = (a: Row) => {
    const v = useView.getState()
    // Not on the tree yet: its tracks go on, unrated, and album view opens on it to rate them.
    if (a.staged) return void addStagedAlbum(a.id)
    if (v.albumView === a.id) return v.setAlbumView(null)
    enterAlbumView(a.id)
  }

  // Album view ends if its album leaves the tree, on Esc (with no popup or palette open), and with the panel.
  const viewing = useView(v => v.albumView)
  const panel = useView(sidePanel)
  const comparing = useView(isComparing)
  const overview = useView(artistView)
  const hidden = useView(v => v.hiddenAlbums)
  const toggleHidden = useView(v => v.toggleAlbumsHidden)
  const onTreeIds = groups.flatMap(g => g.albums.filter(a => !a.staged).map(a => a.id)).join(',')
  useEffect(() => { if (viewing && !onTreeIds.split(',').includes(viewing)) useView.getState().setAlbumView(null) }, [viewing, onTreeIds])
  // Album view opens the album's artist here, so its row shows.
  const viewingArtist = viewing ? s.albums[viewing]?.artistId : undefined
  useEffect(() => { if (viewingArtist) setOpen(c => c.has(viewingArtist) ? c : new Set(c).add(viewingArtist)) }, [viewingArtist])
  useEffect(() => () => { if (useView.getState().albumView) useView.getState().setAlbumView(null) }, [])
  // Esc (with no popup or palette open) goes back a step: out of album view, or from an artist's albums to the artists.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = useView.getState()
      if (e.key !== 'Escape' || v.editing || document.querySelector('.palette')) return
      // Esc in a text field (a score in the list, a song typed onto Misc) is that field's own.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      v.goBack()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  // Artists come a page at a time, best first: reaching the bottom of the list loads the next page. Watched afresh after
  // each page, so a list that still doesn't fill the catalog keeps loading.
  const nav = useRef<HTMLElement>(null)
  const end = useRef<HTMLDivElement>(null)
  const next = useArtistPages(p => p.next)
  useEffect(() => {
    if (!next || !end.current) return
    const watch = new IntersectionObserver(([e]) => { if (e.isIntersecting) void loadMoreArtists() }, { root: nav.current, rootMargin: '0px 0px 120px 0px' })
    watch.observe(end.current)
    return () => watch.disconnect()
  }, [next, groups.length])

  if (groups.length === 0) return null
  return <nav ref={nav} className={`catalog${panel ? ' in-album-view' : ''}${comparing ? ' in-compare' : ''}`} aria-label="Catalog">
    <div className="catalog-head">
      <span className="catalog-title">Catalog</span>
      <div className="catalog-order" role="radiogroup" aria-label="Order albums by">
        {(['year', 'score'] as const).map(o => <button key={o} role="radio" aria-checked={order === o}
          className={order === o ? 'on' : ''} onClick={() => setOrder(o)}>{o}</button>)}
      </div>
    </div>
    {groups.map(g => {
      const onTree = g.albums.filter(a => !a.staged).map(a => a.id)
      return <div className="catalog-group" key={g.artist?.id ?? ''}>
      {g.artist && <div className="catalog-line line-artist">
        {g.pending
          // Not loaded: none of their albums can have been taken off yet, so all of them are on (if any are on the tree).
          ? g.pending.onTree ? <OnRater name={g.artist.name} ids={[g.artist.id]} hidden={NONE} toggle={() => void takeOff(g.artist!.id)} />
            : <OnRater name={g.artist.name} ids={[]} hidden={NONE} toggle={() => {}} />
          : <OnRater name={g.artist.name} ids={onTree} hidden={hidden} toggle={toggleHidden} />}
        <button className={`catalog-row catalog-artist${overview === g.artist.id ? ' viewing' : ''}`} ref={bind(g.artist.id)}
          onClick={() => onArtist(g.artist!.id)} aria-pressed={overview === g.artist.id}
          aria-label={`${g.artist.name}, ${g.artist.label ? `${g.artist.label} (${g.artist.grade})` : 'unrated'}: overview`}>
          <Thumb image={g.artist.image} round />
          <span className="catalog-name">{g.artist.name}</span>
          <span className="catalog-score">{g.artist.label ?? '—'}</span>
          {g.artist.grade && <span className="catalog-letter" style={{ background: g.artist.color }}>{g.artist.grade}</span>}
        </button>
        <button className="catalog-expand" onClick={() => toggle(g.artist!.id)} aria-expanded={shown(g)}
          aria-label={`${g.artist.name}'s albums`}><span className="catalog-chevron" aria-hidden="true" /></button>
      </div>}
      {shown(g) && g.albums.map(a => <div key={a.id} className="catalog-line line-album">
        {a.staged ? <button className="catalog-onrater none" role="checkbox" aria-checked={false} aria-label={`${a.name}: put on the rater`}
          title="Put on the rater" onClick={() => void addStagedAlbum(a.id)} />
          : <OnRater name={a.name} ids={[a.id]} hidden={hidden} toggle={toggleHidden} />}
        <button className={`catalog-row catalog-album${a.staged ? ' staged' : ''}${viewing === a.id ? ' viewing' : viewing ? ' other' : ''}${!a.staged && hidden.has(a.id) ? ' off' : ''}`}
          ref={bind(a.id)} onClick={() => onAlbum(a)} aria-pressed={a.staged ? undefined : viewing === a.id}
          aria-label={a.staged ? `${a.name}, not on the tree yet` : a.label ? `${a.name}, ${a.label} (${a.grade})` : `${a.name}, ${a.incomplete ? 'incomplete' : 'unrated'}`}>
          <Thumb image={a.image} />
          <span className="catalog-name">{a.name}</span>
          {a.incomplete && !a.staged ? <span className="catalog-incomplete">Incomplete</span>
            : <span className="catalog-score">{a.staged || a.misc ? '' : a.label ?? '—'}</span>}
          {!a.staged && a.grade && <span className="catalog-letter" style={{ background: a.color }}>{a.grade}</span>}
        </button>
      </div>)}
    </div>
    })}
    {next && <div ref={end} className="catalog-more" aria-hidden="true" />}
  </nav>
}

const NONE: ReadonlySet<string> = new Set()

/** An artist not loaded yet, taken off the rater from their box: loads their albums, then takes them all off. */
const takeOff = async (artistId: string) => {
  await loadArtists([artistId])
  const s = useStore.getState()
  if (!isLoaded(s, artistId)) return
  const ids = albumsOf(s, artistId).filter(a => a.addedAt !== undefined).map(a => a.id)
  if (ids.length) useView.getState().toggleAlbumsHidden(ids)
}

/**
 * Album view of an album on the tree: from a click on its row here, or when a staged album's box puts it on the tree
 * (that's how its new tracks get rated). The rater slides right and only that album's songs stay on it.
 */
export const enterAlbumView = (albumId: string) => { useView.getState().setAlbumView(albumId) }

const Thumb = ({ image, round }: { image?: string, round?: boolean }) =>
  image ? <img className={`catalog-thumb${round ? ' round' : ''}`} src={image} alt="" draggable={false} />
    : <span className={`catalog-thumb${round ? ' round' : ''}`} />

/** The on-the-rater box: ticked (all on), a dash (some), empty (none); an empty slot keeps the column when there's nothing to put on. */
const OnRater = ({ name, ids, hidden, toggle }: { name: string, ids: string[], hidden: ReadonlySet<string>, toggle: (ids: string[]) => void }) => {
  if (ids.length === 0) return <span className="catalog-onrater-slot" aria-hidden="true" />
  const off = ids.filter(id => hidden.has(id)).length
  const state = off === 0 ? 'on' : off === ids.length ? 'none' : 'some'
  return <button className={`catalog-onrater ${state}`} role="checkbox" aria-checked={state === 'on' ? true : state === 'some' ? 'mixed' : false}
    aria-label={`${name} on the rater`} title={state === 'none' ? 'Put on the rater' : 'Take off the rater'}
    onClick={() => toggle(off > 0 && off < ids.length ? ids.filter(id => hidden.has(id)) : ids)} />
}
