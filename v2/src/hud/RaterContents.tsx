import { useEffect, useMemo, useRef } from 'react'
import { isSplit, screenAnchors, TRUNK_BOTTOM_ANCHOR, useView } from '../scene/view'
import type { Persisted } from '../shared/model'
import { rating, tracksOf, treeNodes } from '../state/board'
import { usePersisted, useStore } from '../state/store'
import './raterContents.css'

/** Blocks shown before the rest are counted as +N. */
const MAX_BLOCKS = 10
const MAX_BLOCKS_PHONE = 6
const GAP_PX = 18

const NOUN: Record<string, [string, string]> = { music: ['song', 'songs'], movies: ['movie', 'movies'], books: ['book', 'books'] }
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

type Block = { id: string, name: string, image?: string, color?: string, label: string, round?: boolean, ids: string[] }
type Group = { key: string, name?: string, ids: string[], blocks: Block[] }
/** What the rater contents shows: a count line and blocks, in groups (a group's name over its blocks). */
type Contents = { count: string, groups: Group[] }

/** Albums on the tree, oldest first (whether or not they're hidden from the rater for now). */
const albumsOnTree = (s: Persisted) => Object.values(s.albums).filter(a => a.addedAt !== undefined).sort((a, b) => a.addedAt! - b.addedAt!)

const albumBlock = (s: Persisted, id: string): Block => {
  const a = s.albums[id], r = rating(s, id)
  return { id, name: a.name, image: a.image, color: r.tier?.color, label: r.label, ids: [id] }
}

/**
 * What's on the rater right now, just under the bottom of the spine (it follows the spine on screen). On MUSIC it
 * follows what the rater shows:
 * - the default view zoomed out to the artists (view.zoom): one block per artist on it, and how many;
 * - zoomed in to albums or songs: their albums under each artist's name, and how many albums or songs;
 *   (view.drill: just that artist's)
 * - album view: the album, and how many songs;
 * - split view: every album, grouped under its artist, and how many songs.
 * Each block has a bar in its grade's colour. Click one to take it off the rater for now (its marks draw back into the
 * spine; view.hiddenAlbums: an artist's block, all of their albums) or bring it back; click an artist's name over
 * their albums for all of theirs. Elsewhere it's just the count.
 */
export const RaterContents = () => {
  const s = usePersisted()
  const type = useStore(st => st.activeType)
  const viewing = useView(v => v.albumView)
  const drill = useView(v => v.drill)
  const zoom = useView(v => v.zoom)
  const split = useView(isSplit)
  const hidden = useView(v => v.hiddenAlbums)
  const toggle = useView(v => v.toggleAlbumsHidden)
  const root = useRef<HTMLDivElement>(null)
  const nodes = type ? treeNodes(s, type) : []

  const contents = useMemo((): Contents | null => {
    if (!type) return null
    if (type !== 'music') {
      const [one, many] = NOUN[type]
      return { count: count(treeNodes(s, type).length, one, many), groups: [] }
    }
    const albums = albumsOnTree(s)
    const songsShowing = (ids: string[]) => ids.flatMap(id => tracksOf(s, id).filter(t => t.branch && !t.hidden)).length
    const of = (showing: number, all: number, one: string, many: string) =>
      showing < all ? `${showing} of ${count(all, one, many)}` : count(all, one, many)

    if (viewing && s.albums[viewing]) {
      return { count: count(songsShowing([viewing]), 'song', 'songs'), groups: [{ key: viewing, ids: [viewing], blocks: [albumBlock(s, viewing)] }] }
    }
    // Albums under their artist's name: split view's, or the default view's zoomed in to albums or songs.
    const grouped = (list: typeof albums) => {
      const byArtist = new Map<string, Group>()
      for (const a of list) {
        const key = a.artistId && s.artists[a.artistId] ? a.artistId : ''
        let g = byArtist.get(key)
        if (!g) byArtist.set(key, g = { key, name: key ? s.artists[key].name : '—', ids: [], blocks: [] })
        g.ids.push(a.id)
        g.blocks.push(albumBlock(s, a.id))
      }
      return [...byArtist.values()]
    }
    const songCount = (ids: string[]) => of(songsShowing(ids.filter(id => !hidden.has(id))), songsShowing(ids), 'song', 'songs')
    if (split) return { count: songCount(albums.map(a => a.id)), groups: grouped(albums) }
    // The default view: whose (every artist, or the one picked) and how far in.
    const mine = drill && s.artists[drill] ? albums.filter(a => a.artistId === drill) : albums
    if (zoom === 'albums') {
      const ids = mine.map(a => a.id)
      return { count: of(ids.filter(id => !hidden.has(id)).length, ids.length, 'album', 'albums'), groups: grouped(mine) }
    }
    if (zoom === 'songs') return { count: songCount(mine.map(a => a.id)), groups: grouped(mine) }
    // The artists: one block each, standing for all of their albums on the tree.
    const byArtist = new Map<string, string[]>()
    for (const a of mine) if (a.artistId && s.artists[a.artistId]) byArtist.set(a.artistId, [...(byArtist.get(a.artistId) ?? []), a.id])
    const blocks = [...byArtist].map(([id, ids]): Block => {
      const ar = s.artists[id], r = rating(s, id)
      return { id, name: ar.name, image: ar.image, color: r.tier?.color, label: r.label, round: true, ids }
    })
    const showing = blocks.filter(b => !b.ids.every(id => hidden.has(id))).length
    return { count: of(showing, blocks.length, 'artist', 'artists'), groups: [{ key: 'artists', ids: blocks.flatMap(b => b.ids), blocks }] }
  }, [s, type, viewing, drill, zoom, split, hidden])

  // Every frame: sit under the spine.
  useEffect(() => {
    let frame = 0
    const tick = () => {
      const el = root.current, a = screenAnchors.get(TRUNK_BOTTOM_ANCHOR)
      if (el && a) {
        // Album view: from the spine rightwards, clear of the album's details on the left. Phones (spine near the left
        // edge): centred on the page.
        const phone = window.innerWidth <= 640, centre = !useView.getState().albumView || phone
        const x = phone ? window.innerWidth / 2 : a.x
        el.style.transform = `translate(${Math.round(x)}px, ${Math.round(a.y + GAP_PX)}px)${centre ? ' translate(-50%, 0)' : ''}`
        el.style.visibility = a.visible ? 'visible' : 'hidden'
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!type || !contents || nodes.length === 0) return null
  // Phones have room for fewer.
  const most = window.innerWidth <= 640 ? MAX_BLOCKS_PHONE : MAX_BLOCKS
  let left = most
  const more = Math.max(0, contents.groups.reduce((n, g) => n + g.blocks.length, 0) - most)
  // Keyed by what it shows, so changing level plays its entrance again.
  const level = viewing ? `album:${viewing}` : split ? 'split' : `${zoom}:${drill ?? ''}`
  return <section ref={root} className={`rater-contents${viewing ? ' in-album-view' : ''}`} aria-label="Rater contents">
    <div className="rater-contents-title">Rater contents <span className="rater-contents-count">{contents.count}</span></div>
    {contents.groups.length > 0 && <div className="rater-contents-groups" key={level}>
      {contents.groups.map(g => {
        const shown = g.blocks.slice(0, Math.max(0, left)); left -= shown.length
        if (shown.length === 0) return null
        const allHidden = g.ids.every(id => hidden.has(id))
        return <div className="rater-contents-group" key={g.key}>
          {g.name && <button className={`rater-contents-artist${allHidden ? ' off' : ''}`} onClick={() => toggle(g.ids)} title={g.name}
            aria-pressed={!allHidden} aria-label={`${g.name}: ${allHidden ? 'show on the rater' : 'hide from the rater'}`}>{g.name}</button>}
          <div className="rater-contents-covers">
            {shown.map(b => {
              const off = b.ids.every(id => hidden.has(id))
              return <button key={b.id} title={b.label ? `${b.name} · ${b.label}` : b.name} aria-pressed={!off}
                aria-label={`${b.name}${b.label ? `, ${b.label}` : ''}: ${off ? 'show on the rater' : 'hide from the rater'}`}
                className={`rater-contents-cover${b.round ? ' round' : ''}${off ? ' off' : ''}${viewing === b.id ? ' viewing' : ''}`}
                onClick={() => { if (!viewing) toggle(b.ids) }}>
                {b.image ? <img src={b.image} alt="" draggable={false} /> : <span className="rater-contents-blank" />}
                <span className="rater-contents-grade" style={b.color ? { background: b.color } : undefined} />
                {b.round && <span className="rater-contents-name">{b.name}</span>}
              </button>
            })}
          </div>
        </div>
      })}
      {more > 0 && <span className="rater-contents-more">+{more}</span>}
    </div>}
  </section>
}
