import { useEffect, useRef, useState } from 'react'
import { RATING_FADE, ratingFocus, screenAnchors, TRUNK_BOTTOM_ANCHOR, TRUNK_TOP_ANCHOR, useView } from '../scene/view'
import { useGlow } from '../scene/useGlow'
import type { Album } from '../shared/model'
import { stagedAlbums } from '../state/board'
import { usePersisted } from '../state/store'
import { addStagedAlbum } from './albumDetails'
import './stagedList.css'

/** A press that moves further than this (px) is a drag, not a click. */
const CLICK_SLOP_PX = 6
/** Let go within this many pixels (sideways) of the trunk on screen, at a height along it, and the album goes on. */
const DROP_PX = 70
/** Slack above the trunk's top and below its bottom (px) that still counts as on it. */
const DROP_END_PX = 40

/** Whether a point on screen is over the trunk, as it's drawn right now (Axis publishes both of its ends). */
const overTrunk = (x: number, y: number) => {
  const top = screenAnchors.get(TRUNK_TOP_ANCHOR), bottom = screenAnchors.get(TRUNK_BOTTOM_ANCHOR)
  if (!top || !bottom || !top.visible || !bottom.visible) return false
  if (y < top.y - DROP_END_PX || y > bottom.y + DROP_END_PX) return false
  const t = bottom.y === top.y ? 0 : (y - top.y) / (bottom.y - top.y)
  return Math.abs(x - (top.x + (bottom.x - top.x) * t)) < DROP_PX
}

type Carry = { id: string, image?: string, x: number, y: number, over: boolean, pending: boolean }

/**
 * The staging tray (MUSIC): albums in the database whose tracks aren't on the tree yet, as a list under the + key:
 * cover, artist, name, oldest first. Tap one for its tracklist (the popup and its trash icon pin beside the row). Drag
 * one onto the trunk to put its tracks on the tree and open album view on it, where they get rated
 * (albumDetails.addStagedAlbum); its cover follows the pointer and swells over the trunk. Let go anywhere else and
 * nothing happens. Hidden in album view, which takes the left half of the screen.
 */
export const StagedList = () => {
  const s = usePersisted()
  const albums = stagedAlbums(s)
  const viewing = useView(v => v.albumView)
  const rows = useRef(new Map<string, { row: HTMLElement, thumb: HTMLElement }>())
  const [carry, setCarry] = useState<Carry | null>(null)
  const press = useRef<{ id: string, image?: string, pointerId: number, x: number, y: number, moved: boolean } | null>(null)
  const key = albums.map(a => a.id).join(',')

  // Every frame: publish each row's place (for the popup and trash icon), fade what isn't being rated.
  useEffect(() => {
    let frame = 0
    const tick = () => {
      const focus = ratingFocus.ids
      for (const [id, { row, thumb }] of rows.current) {
        // The cover (the trash icon pins to it), as wide as the row, so the popup opens beside the row, not over its text.
        const r = thumb.getBoundingClientRect(), w = row.getBoundingClientRect()
        const x = r.left + r.width / 2
        screenAnchors.set(id, { x, y: r.top + r.height / 2, r: r.width / 2, visible: r.height > 0, halfWidth: Math.max(r.width / 2, w.right - x) })
        row.style.opacity = focus && !focus.has(id) ? String(1 - RATING_FADE) : ''
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    const ids = key.split(',')
    return () => { cancelAnimationFrame(frame); for (const id of ids) screenAnchors.delete(id) }
  }, [key])

  const onDown = (a: Album) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || carry?.pending) return
    e.currentTarget.setPointerCapture(e.pointerId)
    press.current = { id: a.id, image: a.image, pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false }
  }
  const onMove = (e: React.PointerEvent) => {
    const p = press.current
    if (!p || e.pointerId !== p.pointerId) return
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) < CLICK_SLOP_PX) return
    if (!p.moved) {
      p.moved = true
      const v = useView.getState()
      if (v.openId) v.close()
      document.body.style.cursor = 'grabbing'
    }
    setCarry({ id: p.id, image: p.image, x: e.clientX, y: e.clientY, over: overTrunk(e.clientX, e.clientY), pending: false })
  }
  const onUp = (e: React.PointerEvent) => {
    const p = press.current
    if (!p || e.pointerId !== p.pointerId) return
    press.current = null
    document.body.style.cursor = ''
    if (!p.moved) return useView.getState().toggleOpen(p.id)
    if (e.type === 'pointercancel' || !overTrunk(e.clientX, e.clientY)) return setCarry(null)
    // Held where it was dropped while the tracklist loads; on success the album leaves this list.
    setCarry({ id: p.id, image: p.image, x: e.clientX, y: e.clientY, over: true, pending: true })
    void addStagedAlbum(p.id).then(() => setCarry(null))
  }
  useEffect(() => () => { document.body.style.cursor = '' }, [])

  const bind = (id: string) => (row: HTMLElement | null) => {
    if (row) rows.current.set(id, { row, thumb: row.querySelector('.staged-thumb') as HTMLElement })
    else rows.current.delete(id)
  }

  if (albums.length === 0 && !carry) return null
  return <>
    {albums.length > 0 && <nav className={`staged-list${viewing ? ' in-album-view' : ''}`} aria-label="Unrated albums">
      <div className="staged-title">Unrated</div>
      {albums.map(a => <StagedRow key={a.id} album={a} artist={a.artistId ? s.artists[a.artistId]?.name : undefined}
        carried={carry?.id === a.id} bind={bind(a.id)} onDown={onDown(a)} onMove={onMove} onUp={onUp} />)}
    </nav>}
    {carry && <div className={`staged-carry${carry.over ? ' over' : ''}`} aria-hidden="true"
      style={{ transform: `translate(${carry.x}px, ${carry.y}px) translate(-50%, -50%)` }}>
      {carry.image ? <img src={carry.image} alt="" draggable={false} /> : <span />}
    </div>}
  </>
}

const StagedRow = ({ album, artist, carried, bind, onDown, onMove, onUp }: {
  album: Album, artist?: string, carried: boolean, bind: (el: HTMLElement | null) => void,
  onDown: (e: React.PointerEvent<HTMLButtonElement>) => void, onMove: (e: React.PointerEvent) => void, onUp: (e: React.PointerEvent) => void,
}) => {
  // Works out (and saves) the cover's colour once, as the floating spheres used to.
  useGlow(album)
  return <button ref={bind} className={`staged-row${carried ? ' carried' : ''}`} title={`${artist ? `${artist} · ` : ''}${album.name}`}
    aria-label={`${album.name}${artist ? ` by ${artist}` : ''}: show tracklist, or drag onto the tree`}
    onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
    {album.image ? <img className="staged-thumb" src={album.image} alt="" draggable={false} /> : <span className="staged-thumb" />}
    <span className="staged-artist">{artist ?? '—'}</span>
    <span className="staged-name">{album.name}</span>
  </button>
}
