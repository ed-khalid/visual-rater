import { useEffect, useMemo, useRef } from 'react'
import { angleDelta, cameraAzimuth, facingAzimuth, screenAnchors, TRUNK_BOTTOM_ANCHOR, useView } from '../scene/view'
import { rating, tracksOf, treeNodes } from '../state/board'
import { usePersisted, useStore } from '../state/store'
import './raterContents.css'

/** How close (radians) the camera has to be to an album's plane for it to count as facing you. */
const FACING_TOLERANCE = 0.3
/** Covers shown before the rest are counted as +N. */
const MAX_COVERS = 10
const GAP_PX = 18

const NOUN: Record<string, [string, string]> = { music: ['song', 'songs'], movies: ['movie', 'movies'], books: ['book', 'books'] }

type Cover = { id: string, name: string, image?: string, color?: string, label: string, angle?: number }
type Group = { artistId: string, artist: string, albums: Cover[] }

/**
 * What's on the rater right now, just under the bottom of the trunk (it follows the trunk on screen): how many items
 * are on it and, on MUSIC, its albums grouped by artist (in the order they went on): the artist's name over a cover
 * for each album, with a thin bar in the album's grade colour. Click a cover to take that album off the tree for now
 * (its branches draw back into the trunk; view.hiddenAlbums) or bring it back; click an artist's name for all of
 * theirs. The albums whose branches face the camera light up as you orbit.
 */
export const RaterContents = () => {
  const s = usePersisted()
  const type = useStore(st => st.activeType)
  const viewing = useView(v => v.albumView)
  const hidden = useView(v => v.hiddenAlbums)
  const toggle = useView(v => v.toggleAlbumsHidden)
  const root = useRef<HTMLDivElement>(null)
  const covers = useRef(new Map<string, { el: HTMLElement, angle?: number }>())

  const nodes = type ? treeNodes(s, type) : []
  const groups = useMemo(() => {
    if (type !== 'music') return []
    const byArtist = new Map<string, Group>()
    for (const a of Object.values(s.albums).filter(a => a.addedAt !== undefined).sort((a, b) => a.addedAt! - b.addedAt!)) {
      const key = a.artistId && s.artists[a.artistId] ? a.artistId : ''
      let g = byArtist.get(key)
      if (!g) byArtist.set(key, g = { artistId: key, artist: key ? s.artists[key].name : '—', albums: [] })
      const r = rating(s, a.id), onTree = tracksOf(s, a.id).filter(t => t.branch && !t.hidden)
      g.albums.push({ id: a.id, name: a.name, image: a.image, color: r.tier?.color, label: r.label, angle: onTree[0]?.branch!.angle })
    }
    return [...byArtist.values()]
  }, [s, type])

  // Every frame: sit under the trunk, and mark the albums facing the camera.
  useEffect(() => {
    let frame = 0
    const tick = () => {
      const el = root.current, a = screenAnchors.get(TRUNK_BOTTOM_ANCHOR)
      if (el && a) {
        el.style.transform = `translate(${Math.round(a.x)}px, ${Math.round(a.y + GAP_PX)}px) translate(-50%, 0)`
        el.style.visibility = a.visible ? 'visible' : 'hidden'
      }
      const az = cameraAzimuth.value
      for (const { el, angle } of covers.current.values())
        el.classList.toggle('facing', angle !== undefined && Math.abs(angleDelta(az, facingAzimuth(angle, az))) < FACING_TOLERANCE)
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!type || nodes.length === 0) return null
  const [one, many] = NOUN[type]
  const showing = nodes.filter(n => !((n.entity as { albumId?: string }).albumId && hidden.has((n.entity as { albumId: string }).albumId))).length
  let left = MAX_COVERS
  const more = Math.max(0, groups.reduce((n, g) => n + g.albums.length, 0) - MAX_COVERS)
  return <section ref={root} className={`rater-contents${viewing ? ' in-album-view' : ''}`} aria-label="Rater contents">
    <div className="rater-contents-title">Rater contents <span className="rater-contents-count">
      · {showing < nodes.length ? `${showing} of ${nodes.length}` : nodes.length} {nodes.length === 1 ? one : many}</span></div>
    {groups.length > 0 && <div className="rater-contents-groups">
      {groups.map(g => {
        const shown = g.albums.slice(0, Math.max(0, left)); left -= shown.length
        if (shown.length === 0) return null
        const ids = g.albums.map(a => a.id), allHidden = ids.every(id => hidden.has(id))
        return <div className="rater-contents-group" key={g.artistId}>
          <button className={`rater-contents-artist${allHidden ? ' off' : ''}`} onClick={() => toggle(ids)} title={g.artist}
            aria-pressed={!allHidden} aria-label={`${g.artist}: ${allHidden ? 'show on the tree' : 'hide from the tree'}`}>{g.artist}</button>
          <div className="rater-contents-covers">
            {shown.map(a => {
              const off = hidden.has(a.id)
              return <button key={a.id} title={`${a.name} · ${a.label}`} aria-pressed={!off}
                aria-label={`${a.name}, ${a.label}: ${off ? 'show on the tree' : 'hide from the tree'}`}
                className={`rater-contents-cover${off ? ' off' : ''}${viewing === a.id ? ' viewing' : ''}`} onClick={() => toggle([a.id])}
                ref={el => { if (el) covers.current.set(a.id, { el, angle: a.angle }); else covers.current.delete(a.id) }}>
                {a.image ? <img src={a.image} alt="" draggable={false} /> : <span className="rater-contents-blank" />}
                <span className="rater-contents-grade" style={a.color ? { background: a.color } : undefined} />
              </button>
            })}
          </div>
        </div>
      })}
      {more > 0 && <span className="rater-contents-more">+{more}</span>}
    </div>}
  </section>
}
