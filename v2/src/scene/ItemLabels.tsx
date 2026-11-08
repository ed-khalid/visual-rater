import { useMemo } from 'react'
import { treeNodes } from '../state/board'
import { type Track, useStore } from '../state/store'
import { useView } from './view'
import { labelElements, scaleElements } from './labels'
import { nodeKey, useDrillNodes } from './Nodes'
import './items.css'

/**
 * DOM layer holding one name label per thing on the open tree: beside fruit (with an UNRATED tag until it's
 * dragged), and beside the read-only rater's artists and albums.
 * The 3D objects position them every frame (see Items.tsx).
 */
export const ItemLabels = () => {
  const activeType = useStore(s => s.activeType)
  const listing = useView(v => v.phase === 'list')
  const artists = useStore(s => s.artists), albums = useStore(s => s.albums), tracks = useStore(s => s.tracks)
  const movies = useStore(s => s.movies), books = useStore(s => s.books)

  const nodes = useDrillNodes()
  const labels = useMemo(() => {
    if (!activeType) return []
    const s = { artists, albums, tracks, movies, books }
    return [
      // a track goes by its short title, if it has one (the full name is clutter on the rater)
      ...treeNodes(s, activeType).map(n => ({ id: n.id, kind: 'side', name: (n.entity as Track).shortTitle ?? n.entity.name, unrated: n.entity.score === undefined })),
      // the read-only rater's artists and albums (MUSIC; Nodes)
      ...[...new Map(nodes.map(n => [n.node.id, n.node])).values()]
        .map(n => ({ id: nodeKey(n.id), kind: 'side', name: n.name, unrated: n.score === undefined })),
    ]
  }, [activeType, artists, albums, tracks, movies, books, nodes])

  if (listing) return null
  return <div className="item-labels">
    {activeType && Array.from({ length: 11 }, (_, i) => i * 10).map(value =>
      <div
        key={`scale-${value}`}
        className={`scale-label${value % 50 === 0 ? ' scale-label-major' : ''}`}
        aria-hidden="true"
        ref={el => {
          if (el) scaleElements.set(value, el)
          return () => { scaleElements.delete(value) }
        }}
      >
        {value}
      </div>
    )}
    {labels.map(({ id, kind, name, unrated }) =>
      <div
        key={id}
        className={`item-label item-label-${kind}${unrated ? ' item-label-unrated' : ''}`}
        title={name}
        ref={el => {
          if (el) labelElements.set(id, el)
          return () => { labelElements.delete(id) }
        }}
      >
        {name}{unrated && <span className="item-label-tag">UNRATED</span>}
      </div>
    )}
  </div>
}
