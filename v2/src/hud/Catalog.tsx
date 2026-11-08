import { useEffect, useMemo, useRef, useState } from 'react'
import { RATING_FADE, ratingFocus, screenAnchors, useView } from '../scene/view'
import { rating, tracksOf } from '../state/board'
import { albumScore, artistScore } from '../state/scores'
import { usePersisted } from '../state/store'
import './catalog.css'

type Row = {
  id: string, name: string, image?: string, year?: number, score?: number
  /** In the staging tray: none of its tracks are on the tree yet. */
  staged?: boolean
  /** The score as shown, its letter grade and that grade's colour (v1's), if it has a score yet. Artists and albums show both. */
  label?: string, color?: string, grade?: string
}
type Order = 'year' | 'score'

/** Albums by year (oldest first) or by score (best first); those without one go last, in the order they went on. */
const byOrder = (order: Order) => (a: Row, b: Row) => {
  const x = order === 'year' ? a.year : a.score, y = order === 'year' ? b.year : b.score
  if (x === undefined || y === undefined) return (x === undefined ? 1 : 0) - (y === undefined ? 1 : 0)
  return order === 'year' ? x - y : y - x
}
type Group = { artist?: Row, albums: Row[] }

/**
 * The catalog (MUSIC): every artist and album in the database, on the tree or not, in the left-hand sidebar under the
 * + key. Artists go best first (by artist score), unrated ones after. (What's on the rater right now is
 * hud/RaterContents.tsx, under the spine.)
 * - click an album on the tree for album view (view.albumView, hud/AlbumView.tsx): every other album draws back into
 *   the spine and its title and details fill the left half of the screen (the rater slides right to make room). Another album switches to that one; clicking it
 *   again, a click on empty space (with nothing open) or Esc leaves album view.
 * - click a staged album (dim, no score yet) for its tracklist.
 * Each artist and album shows its score and letter grade (v1's grades), the letter on a chip in the grade's colour.
 * Each artist collapses to its own row (click it); albums go by year or by score (the switch at the top).
 * No hover behaviour (for now). Each thumbnail of something on the tree publishes its place on screen (screenAnchors),
 * so the popup (to the right of the row) and its trash icon pin to it. In active rating, the rows not being rated fade.
 */
export const Catalog = () => {
  const s = usePersisted()
  const [order, setOrder] = useState<Order>('year')
  // Every artist starts collapsed; click one to open it.
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const toggle = (id: string) => setOpen(c => { const n = new Set(c); if (!n.delete(id)) n.add(id); return n })
  const groups = useMemo(() => {
    const albums = Object.values(s.albums).sort((a, b) => a.stagedAt - b.stagedAt)
    const byArtist = new Map<string, Group>()
    for (const a of albums) {
      const key = a.artistId && s.artists[a.artistId] ? a.artistId : ''
      let g = byArtist.get(key)
      if (!g) {
        const artist = key ? s.artists[key] : undefined
        const r = artist && rating(s, artist.id)
        g = { artist: artist && { id: artist.id, name: artist.name, image: artist.image,
          ...(r?.tier ? { label: r.label, color: r.tier.color, grade: r.tier.name } : {}) }, albums: [] }
        byArtist.set(key, g)
      }
      const score = albumScore(tracksOf(s, a.id)), r = rating(s, a.id)
      g.albums.push({ id: a.id, name: a.name, image: a.image, year: a.year, score, staged: a.addedAt === undefined,
        ...(r.tier ? { label: r.label, color: r.tier.color, grade: r.tier.name } : {}) })
    }
    for (const g of byArtist.values()) g.albums.sort(byOrder(order))
    // Artists best first, by artist score; unrated ones after them (by name), and albums with no artist last.
    const tracks = Object.values(s.tracks)
    const scoreOf = (id: string) => id ? artistScore(tracks.filter(t => t.artistId === id)) : undefined
    const scores = new Map([...byArtist.keys()].map(k => [k, scoreOf(k)]))
    return [...byArtist.entries()].sort(([a, ga], [b, gb]) =>
      (a === '' ? 1 : 0) - (b === '' ? 1 : 0)
      || (scores.get(a) === undefined ? 1 : 0) - (scores.get(b) === undefined ? 1 : 0)
      || (scores.get(b) ?? 0) - (scores.get(a) ?? 0)
      || (ga.artist?.name ?? '').localeCompare(gb.artist?.name ?? ''))
      .map(([, g]) => g)
  }, [s, order])

  const rows = useRef(new Map<string, { row: HTMLElement, thumb: HTMLElement }>())
  const shown = (g: Group) => !g.artist || open.has(g.artist.id)
  const ids = groups.flatMap(g => [...(g.artist ? [g.artist.id] : []), ...(shown(g) ? g.albums.filter(a => !a.staged).map(a => a.id) : [])])
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
  const onAlbum = (a: Row) => {
    const v = useView.getState()
    if (a.staged) return v.toggleOpen(a.id)
    if (v.openId) v.close()
    if (v.albumView === a.id) return v.setAlbumView(null)
    enterAlbumView(a.id)
  }

  // Album view ends if its album leaves the tree, on Esc (with no popup or palette open), and with the panel.
  const viewing = useView(v => v.albumView)
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
      if (e.key !== 'Escape' || v.openId || v.editing || document.querySelector('.palette')) return
      v.goBack()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  if (groups.length === 0) return null
  return <nav className={`catalog${viewing ? ' in-album-view' : ''}`} aria-label="Catalog">
    <div className="catalog-head">
      <span className="catalog-title">Catalog</span>
      <div className="catalog-order" role="radiogroup" aria-label="Order albums by">
        {(['year', 'score'] as const).map(o => <button key={o} role="radio" aria-checked={order === o}
          className={order === o ? 'on' : ''} onClick={() => setOrder(o)}>{o}</button>)}
      </div>
    </div>
    {groups.map(g => <div className="catalog-group" key={g.artist?.id ?? ''}>
      {g.artist && <button className="catalog-row catalog-artist" ref={bind(g.artist.id)}
        onClick={() => toggle(g.artist!.id)} aria-expanded={shown(g)}
        aria-label={g.artist.label ? `${g.artist.name}, ${g.artist.label} (${g.artist.grade})` : `${g.artist.name}, unrated`}>
        <Thumb image={g.artist.image} round />
        <span className="catalog-name">{g.artist.name}</span>
        <span className="catalog-score">{g.artist.label ?? '—'}</span>
        {g.artist.grade && <span className="catalog-letter" style={{ background: g.artist.color }}>{g.artist.grade}</span>}
        <span className="catalog-chevron" aria-hidden="true" />
      </button>}
      {shown(g) && g.albums.map(a => <button key={a.id} className={`catalog-row catalog-album${a.staged ? ' staged' : ''}${viewing === a.id ? ' viewing' : viewing ? ' other' : ''}`}
        ref={a.staged ? undefined : bind(a.id)} onClick={() => onAlbum(a)} aria-pressed={a.staged ? undefined : viewing === a.id}
        aria-label={a.staged ? `${a.name}, not on the tree yet` : a.label ? `${a.name}, ${a.label} (${a.grade})` : `${a.name}, unrated`}>
        <Thumb image={a.image} />
        <span className="catalog-name">{a.name}</span>
        <span className="catalog-score">{a.staged ? '' : a.label ?? '—'}</span>
        {!a.staged && a.grade && <span className="catalog-letter" style={{ background: a.color }}>{a.grade}</span>}
      </button>)}
    </div>)}
  </nav>
}

/**
 * Album view of an album on the tree: from a click on its row here, or when a staged album is dropped on the tree
 * (that's how its new tracks get rated). The rater slides right and only that album's songs stay on it.
 */
export const enterAlbumView = (albumId: string) => { useView.getState().setAlbumView(albumId) }

const Thumb = ({ image, round }: { image?: string, round?: boolean }) =>
  image ? <img className={`catalog-thumb${round ? ' round' : ''}`} src={image} alt="" draggable={false} />
    : <span className={`catalog-thumb${round ? ' round' : ''}`} />
