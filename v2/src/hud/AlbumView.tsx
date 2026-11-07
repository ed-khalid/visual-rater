import { useView } from '../scene/view'
import { rating as ratingOf } from '../state/board'
import { usePersisted } from '../state/store'
import { AlbumPopup } from './AlbumOverlays'
import './albumView.css'

/**
 * Album view's HUD (MUSIC): on the left, the album's title card in three columns (its cover, the artist, album and
 * year, and its letter grade in the grade's colour beside its score), and its details (tracklist, EDIT) docked underneath. Shown while
 * view.albumView is set (from the catalog or the rater contents).
 */
export const AlbumView = () => {
  const id = useView(v => v.albumView)
  const s = usePersisted()
  const album = id ? s.albums[id] : undefined
  if (!id || !album) return null
  const artist = album.artistId ? s.artists[album.artistId]?.name : undefined
  const r = ratingOf(s, id)
  return <section className="album-view" aria-label={`Album view: ${album.name}`}>
    <header className="album-view-title">
      {/* Three columns: the cover, the album's names and year, its grade (in its colour) beside its score; each full height. */}
      {album.image ? <img className="album-view-cover" src={album.image} alt="" draggable={false} />
        : <div className="album-view-cover" />}
      <div className="album-view-names">
        <div className="album-view-artist">{artist ?? '—'}</div>
        <h1 className="album-view-name">{album.name}</h1>
        <div className="album-view-year">{album.year ?? '—'}</div>
      </div>
      {r.tier
        ? <div className="album-view-rating">
          <div className="album-view-grade" style={{ background: r.tier.color }}>{r.tier.name}</div>
          <div className="album-view-score">{r.label}</div>
        </div>
        : <div className="album-view-rating"><div className="album-view-score dim">UNRATED</div></div>}
    </header>
    <AlbumPopup docked={id} />
  </section>
}
