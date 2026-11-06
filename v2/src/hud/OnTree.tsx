import { useEffect, useMemo, useRef, useState } from 'react'
import { angleDelta, cameraAzimuth, facingAzimuth, RATING_FADE, ratingFocus, screenAnchors, useView } from '../scene/view'
import { rating, tracksOf } from '../state/board'
import { albumScore } from '../state/scores'
import { usePersisted, useStore } from '../state/store'
import './onTree.css'

/** How close (radians) the camera has to be to an album's plane for it to count as facing you. */
const FACING_TOLERANCE = 0.3

type Row = {
  id: string, name: string, image?: string, angle?: number, year?: number, score?: number
  /** The score as shown, its letter grade and that grade's colour (v1's), if it has a score yet. Artists show the grade, albums the score. */
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
 * What's on the tree right now (MUSIC): a panel in the bottom-right corner with each artist and, under them, their albums whose
 * tracks are on the tree. It's the way round the tree:
 * - click an album for album view (view.albumView, hud/AlbumView.tsx): every other album draws back into the trunk,
 *   the camera turns so its branches run out to the right and towards you, and its title and details fill the left
 *   half of the screen (the tree slides right to make room). Another album switches to that one; clicking it again, a click on empty space (with nothing open) or Esc
 *   leaves album view.
 * The albums facing the camera are highlighted as you orbit.
 * Each album shows its score and each artist its letter grade, with a thin bar in the grade's colour (v1's album and
 * artist grades) before the thumbnail.
 * Each artist collapses to its own row (click it); albums go by year or by score (the switch at the top).
 * No hover behaviour (for now). Each thumbnail publishes its place on screen (screenAnchors), so the popup and its
 * trash icon pin to it (on its left) the way they pin to a sphere. In active rating, the rows not being rated fade.
 */
export const OnTree = () => {
  const s = usePersisted()
  const [order, setOrder] = useState<Order>('year')
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const toggle = (id: string) => setCollapsed(c => { const n = new Set(c); if (!n.delete(id)) n.add(id); return n })
  const groups = useMemo(() => {
    const albums = Object.values(s.albums).filter(a => a.addedAt !== undefined).sort((a, b) => a.addedAt! - b.addedAt!)
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
      const tracks = tracksOf(s, a.id)
      const onTree = tracks.find(t => t.branch && !t.hidden)
      const score = albumScore(tracks), r = rating(s, a.id)
      g.albums.push({ id: a.id, name: a.name, image: a.image, angle: onTree?.branch!.angle, year: a.year, score,
        ...(r.tier ? { label: r.label, color: r.tier.color, grade: r.tier.name } : {}) })
    }
    for (const g of byArtist.values()) g.albums.sort(byOrder(order))
    // Albums with no artist go last.
    return [...byArtist.entries()].sort(([a], [b]) => (a === '' ? 1 : 0) - (b === '' ? 1 : 0)).map(([, g]) => g)
  }, [s, order])

  const rows = useRef(new Map<string, { row: HTMLElement, thumb: HTMLElement, angle?: number }>())
  const shown = (g: Group) => !g.artist || !collapsed.has(g.artist.id)
  const ids = groups.flatMap(g => [...(g.artist ? [g.artist.id] : []), ...(shown(g) ? g.albums.map(a => a.id) : [])])
  const key = ids.join(',')

  // Every frame: publish each thumbnail's place, mark the albums facing the camera, fade what isn't being rated.
  useEffect(() => {
    let frame = 0
    const tick = () => {
      const az = cameraAzimuth.value, focus = ratingFocus.ids
      for (const [id, { row, thumb, angle }] of rows.current) {
        const r = thumb.getBoundingClientRect()
        screenAnchors.set(id, { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2, visible: r.height > 0, preferLeft: true })
        row.classList.toggle('facing', angle !== undefined && Math.abs(angleDelta(az, facingAzimuth(angle, az))) < FACING_TOLERANCE)
        row.style.opacity = focus && !focus.has(id) ? String(1 - RATING_FADE) : ''
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    const shown = key.split(',')
    return () => { cancelAnimationFrame(frame); for (const id of shown) screenAnchors.delete(id) }
  }, [key])

  const bind = (id: string, angle?: number) => (row: HTMLElement | null) => {
    if (row) rows.current.set(id, { row, thumb: row.querySelector('.on-tree-thumb') as HTMLElement, angle })
    else rows.current.delete(id)
  }
  const onAlbum = (a: Row) => {
    const v = useView.getState()
    if (v.openId) v.close()
    if (v.albumView === a.id) return v.setAlbumView(null)
    enterAlbumView(a.id)
  }

  // Album view ends if its album leaves the tree, on Esc (with no popup or palette open), and with the panel.
  const viewing = useView(v => v.albumView)
  const onTreeIds = groups.flatMap(g => g.albums.map(a => a.id)).join(',')
  useEffect(() => { if (viewing && !onTreeIds.split(',').includes(viewing)) useView.getState().setAlbumView(null) }, [viewing, onTreeIds])
  useEffect(() => () => { if (useView.getState().albumView) useView.getState().setAlbumView(null) }, [])
  useEffect(() => {
    if (!viewing) return
    const onKey = (e: KeyboardEvent) => {
      const v = useView.getState()
      if (e.key !== 'Escape' || v.openId || v.editing || document.querySelector('.palette')) return
      useView.getState().setAlbumView(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [viewing])

  if (groups.length === 0) return null
  return <nav className="on-tree" aria-label="On the tree">
    <div className="on-tree-order" role="radiogroup" aria-label="Order albums by">
      {(['year', 'score'] as const).map(o => <button key={o} role="radio" aria-checked={order === o}
        className={order === o ? 'on' : ''} onClick={() => setOrder(o)}>{o}</button>)}
    </div>
    {groups.map(g => <div className="on-tree-group" key={g.artist?.id ?? ''}>
      {g.artist && <button className="on-tree-row on-tree-artist" ref={bind(g.artist.id)}
        onClick={() => toggle(g.artist!.id)} aria-expanded={shown(g)}
        aria-label={g.artist.label ? `${g.artist.name}, ${g.artist.label} (${g.artist.grade})` : `${g.artist.name}, unrated`}>
        <Grade row={g.artist} />
        <Thumb image={g.artist.image} round />
        <span className="on-tree-name">{g.artist.name}</span>
        <span className="on-tree-score">{g.artist.grade ?? '—'}</span>
        <span className="on-tree-chevron" aria-hidden="true" />
      </button>}
      {shown(g) && g.albums.map(a => <button key={a.id} className={`on-tree-row on-tree-album${viewing === a.id ? ' viewing' : viewing ? ' other' : ''}`} ref={bind(a.id, a.angle)}
        onClick={() => onAlbum(a)} aria-pressed={viewing === a.id} aria-label={a.label ? `${a.name}, ${a.label} (${a.grade})` : `${a.name}, unrated`}>
        <Grade row={a} />
        <Thumb image={a.image} />
        <span className="on-tree-name">{a.name}</span>
        <span className="on-tree-score">{a.label ?? '—'}</span>
      </button>)}
    </div>)}
  </nav>
}

/**
 * Album view of an album on the tree: from a click on its row here, or when a staged album is dropped on the tree
 * (that's how its new tracks get rated). The camera turns to 45° short of face-on: the album's branches run out to
 * the right and towards you (south-east, as the camera sees it). A branch at angle a points along (sin a, cos a);
 * from a camera at turn a − 45° that's 45° right of straight at you.
 */
export const enterAlbumView = (albumId: string) => {
  const v = useView.getState()
  const angle = tracksOf(useStore.getState(), albumId).find(t => t.branch && !t.hidden)?.branch!.angle
  v.setAlbumView(albumId)
  if (angle !== undefined) v.requestAzimuth(angle - Math.PI / 4)
}

/** A thin bar in the grade's colour; empty when there's no score yet. */
const Grade = ({ row }: { row: Row }) =>
  <span className="on-tree-grade" style={row.color ? { background: row.color } : undefined} title={row.grade} />

const Thumb = ({ image, round }: { image?: string, round?: boolean }) =>
  image ? <img className={`on-tree-thumb${round ? ' round' : ''}`} src={image} alt="" draggable={false} />
    : <span className={`on-tree-thumb${round ? ' round' : ''}`} />
