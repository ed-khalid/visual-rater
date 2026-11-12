import { isComparing, isSplit, sidePanel, useView } from '../scene/view'
import { usePersisted } from '../state/store'
import './breadcrumb.css'

/**
 * Where the rater is (MUSIC), in the top-left corner of the rater's own area, between the two sidebars: Artists (in the list view, the zoom's level: Artists, Albums or Songs),
 * then the artist whose albums are out (view.drill) or whose album is in album view, then the album; split view
 * adds Albums. Each step ends in an arrow ("Artists ›"); every step but the last goes back there.
 */
export const Breadcrumb = () => {
  const s = usePersisted()
  const listing = useView(v => v.phase !== 'tree'), zoom = useView(v => v.zoom)
  const drill = useView(v => v.drill), albumView = useView(v => v.albumView), split = useView(isSplit), panel = useView(sidePanel), comparing = useView(isComparing)
  const album = albumView ? s.albums[albumView] : undefined
  const artistId = album?.artistId ?? drill ?? undefined
  const artist = artistId ? s.artists[artistId] : undefined
  const v = () => useView.getState()
  const steps: { key: string, label: string, go?: () => void }[] = [
    // The list view lists the zoom's level.
    { key: 'all', label: listing ? (zoom === 'artists' ? 'Artists' : zoom === 'albums' ? 'Albums' : 'Songs') : 'Artists', go: () => { v().setAlbumView(null); v().setSplit(false); v().setDrill(null) } },
    ...(split ? [{ key: 'split', label: 'Albums' }] : []),
    ...(!split && artist ? [{ key: `artist:${artist.id}`, label: artist.name, go: () => { v().setAlbumView(null); v().setDrill(artist.id) } }] : []),
    ...(album ? [{ key: `album:${album.id}`, label: album.name }] : []),
  ]
  return <ol className={`breadcrumb${panel ? ' in-album-view' : ''}${comparing ? ' in-compare' : ''}`} aria-label="Breadcrumb">
    {steps.map((st, i) => {
      const last = i === steps.length - 1
      return <li key={st.key} className="breadcrumb-step">
        {last || !st.go
          ? <span aria-current={last ? 'location' : undefined}>{st.label}</span>
          : <button onClick={st.go}>{st.label}</button>}
      </li>
    })}
  </ol>
}
