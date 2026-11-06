import { useMemo } from 'react'
import { find, stagedAlbums, treeNodes } from '../state/board'
import { useStore } from '../state/store'
import { useView } from './view'
import { labelElements, scaleElements } from './labels'
import './items.css'

/**
 * DOM layer holding one name label per thing on the open tree: beside fruit (with an UNRATED tag until it's
 * dragged), under the floating albums and artists.
 * The 3D objects position them every frame (see Items.tsx and StagingArea.tsx).
 */
export const ItemLabels = () => {
  const activeType = useStore(s => s.activeType)
  const listing = useView(v => v.phase === 'list')
  const artists = useStore(s => s.artists), albums = useStore(s => s.albums), tracks = useStore(s => s.tracks)
  const movies = useStore(s => s.movies), books = useStore(s => s.books)

  const labels = useMemo(() => {
    if (!activeType) return []
    const s = { artists, albums, tracks, movies, books }
    const name = (id: string) => find(s, id)?.entity.name ?? ''
    return [
      ...treeNodes(s, activeType).map(n => ({ id: n.id, kind: 'side', name: n.entity.name, unrated: n.entity.score === undefined })),
      // Only the staging tray floats in the scene; albums on the tree are listed by the HUD's on-the-tree panel.
      ...(activeType === 'music' ? stagedAlbums(s).map(a => a.id) : [])
        .map(id => ({ id, kind: 'below', name: name(id), unrated: false })),
    ]
  }, [activeType, artists, albums, tracks, movies, books])

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
