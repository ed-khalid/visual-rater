import { CoverUpload } from './CoverUpload'
import { useShallow } from 'zustand/react/shallow'
import { useBox } from '../scene/box'
import { isComparing, useView } from '../scene/view'
import { albumCover } from '../scene/cover'
import { INCOMPLETE, rating as ratingOf } from '../state/board'
import { usePersisted } from '../state/store'
import { AlbumPopup } from './AlbumOverlays'
import { ComparePicker } from './ComparePicker'
import './albumView.css'

/**
 * Album view's HUD (MUSIC): on the left, the album's title card in three columns (its cover, the artist, album and
 * year, and its letter grade in the grade's colour beside its score), and its details (tracklist, EDIT, COMPARE)
 * docked underneath. Shown while view.albumView is set (from the catalog).
 *
 * Compare (desktop): this one narrows to the left edge, and the right edge gets the picker, then the album picked,
 * mirrored (its cover on the right); the two raters stand between them (scene/Board.tsx CompareRaters).
 */
export const AlbumView = () => {
  const { id, comparing, compareWith, picking } = useView(useShallow(v => ({ id: v.albumView, comparing: isComparing(v), compareWith: v.compareWith, picking: v.picking })))
  const c = useBox().compare
  if (!id) return null
  const on = comparing && !!c
  return <>
    <AlbumPane id={id} side={on ? 'left' : null} width={c?.panel} edge={c?.edge}
      actions={<button className="album-action album-action-compare" onClick={() => { const v = useView.getState(); if (on) v.endCompare(); else v.startCompare() }}>
        {on ? 'END COMPARE' : 'COMPARE'}</button>} />
    {on && compareWith && <AlbumPane id={compareWith} side="right" width={c.panel} edge={c.edge}
      actions={<button className="album-action" onClick={() => useView.getState().setPicking(true)}>CHANGE</button>} />}
    {on && picking && <ComparePicker exclude={id} />}
  </>
}

/** One album's title card and details; `side` set while comparing (its half of the page, mirrored on the right). */
const AlbumPane = ({ id, side, width, edge, actions }: { id: string, side: 'left' | 'right' | null, width?: number, edge?: number, actions?: React.ReactNode }) => {
  const s = usePersisted()
  const album = s.albums[id]
  if (!album) return null
  const artist = album.artistId ? s.artists[album.artistId]?.name : undefined
  const r = ratingOf(s, id)
  const style = side && width !== undefined && edge !== undefined
    ? (side === 'left' ? { left: edge, width } : { left: 'auto', right: edge, width }) : undefined
  // Keyed by album, so switching albums plays the opening again.
  return <section key={id} className={`album-view${side ? ` compare compare-${side}` : ''}`} style={style} aria-label={`Album view: ${album.name}`}>
    <header className="album-view-title">
      {/* Three columns: the cover, the album's names and year, its grade (in its colour) beside its score; each full height. */}
      {/* Singles' cover is drawn, never stored; any other album's can be uploaded. */}
      {album.misc ? <img className="album-view-cover" src={albumCover(album)} alt="" draggable={false} />
        : <CoverUpload id={album.id} name={album.name} image={albumCover(album)} className="album-view-cover" />}
      <div className="album-view-names">
        <div className="album-view-artist">{artist ?? '—'}</div>
        <h1 className="album-view-name">{album.name}</h1>
        {!album.misc && <div className="album-view-year">{album.year ?? '—'}</div>}
      </div>
      {album.misc ? <div className="album-view-rating" />
        : r.tier
        ? <div className="album-view-rating">
          <div className="album-view-grade" style={{ background: r.tier.color }}>{r.tier.name}</div>
          <div className="album-view-score">{r.label}</div>
        </div>
        : <div className="album-view-rating"><div className="album-view-score dim">{r.label === INCOMPLETE ? 'Incomplete' : 'Unrated'}</div></div>}
    </header>
    <AlbumPopup docked={id} actions={actions} />
  </section>
}
