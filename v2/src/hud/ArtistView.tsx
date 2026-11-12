import { CoverUpload } from './CoverUpload'
import { NewAlbum } from './NewAlbum'
import { useLayoutEffect, useRef, useState } from 'react'
import { albumCover } from '../scene/cover'
import { createPortal } from 'react-dom'
import { artistView, useView } from '../scene/view'
import type { Album, Track } from '../shared/model'
import { TRACK_TIERS } from '../shared/scale'
import { albumGrade, formatAlbumScore, formatScore, INCOMPLETE, isLoaded, rating as ratingOf, songTier, tracksByArtist, tracksOf } from '../state/board'
import { shownAlbumScore } from '../state/scores'
import { usePersisted } from '../state/store'
import { AlbumChart, type ChartTrack } from './AlbumChart'
import { addStagedAlbum } from './albumDetails'
import './albumView.css'
import './artistView.css'
import './scoreMatches.css'

const shortYear = (y?: number) => y === undefined ? '—' : `’${String(y).slice(-2)}`
/** Most songs a tier's hover card lists; the rest are counted under them. */
const TIER_SONGS_MAX = 8

/**
 * Artist view's HUD (MUSIC): the artist's overview on the left half, as album view's details are, while an artist is
 * picked on the read-only rater (view.drill) and their albums are out on the rater to the right. The opener (photo,
 * name, how many albums and rated songs, letter grade beside score), then:
 * - Songs by tier: how many of their rated songs are in each song tier, a bar each in the tier's colour; hovering a
 *   tier shows its songs beside it, best first (at most TIER_SONGS_MAX, then how many more);
 * - Career: their albums' scores in release order, a line with a dot per album in its grade's colour;
 * - Albums: each one with its year, score and grade; click one on the tree for album view, a staged one to put it on
 *   the tree (as in the catalog). ADD ALBUM makes one by hand (NewAlbum).
 * Phones: the opener alone.
 */
export const ArtistView = () => {
  const id = useView(artistView)
  const s = usePersisted()
  const [hover, setHover] = useState<{ tier: number, rect: DOMRect } | null>(null)
  /** The artist whose ADD ALBUM form is open, if any (switching artists closes it). */
  const [adding, setAdding] = useState<string | null>(null)
  const artist = id ? s.artists[id] : undefined
  if (!id || !artist) return null

  const r = ratingOf(s, id)
  // Their albums and tracks load as artist view opens (LibraryLoader): the opener shows at once, the rest when they're in.
  const loaded = isLoaded(s, id)
  // Release order; Misc last.
  const albums = Object.values(s.albums).filter(a => a.artistId === id)
    .sort((a, b) => (a.misc ? 1 : 0) - (b.misc ? 1 : 0) || (a.year ?? 9999) - (b.year ?? 9999) || a.stagedAt - b.stagedAt)
  const onTree = albums.filter(a => a.addedAt !== undefined)
  const rated = tracksByArtist(s, id).filter(t => t.score !== undefined && !t.notASong)
  // Songs by tier leaves out live recordings of songs they already have, as their score does.
  const counted = rated.filter(t => !t.live)

  // Songs by tier, best first.
  const counts = TRACK_TIERS.map(t => ({ ...t, songs: [] as Track[] }))
  for (const t of [...counted].sort((a, b) => b.score! - a.score!)) {
    const i = TRACK_TIERS.findIndex(x => x.name === songTier(t.score!).name)
    counts[i < 0 ? counts.length - 1 : i].songs.push(t)
  }
  const most = Math.max(1, ...counts.map(c => c.songs.length))

  // Career: albums on the tree with a score, in release order.
  const career: (ChartTrack & { year?: number })[] = onTree.filter(a => !a.misc)
    .map(a => ({ a, score: shownAlbumScore(tracksOf(s, a.id)) }))
    .filter(x => x.score !== undefined)
    .map(({ a, score }, i) => ({ id: a.id, name: a.name, number: i + 1, disc: 1, score, year: a.year }))

  const open = (a: Album) => {
    if (a.addedAt === undefined) return void addStagedAlbum(a.id)
    useView.getState().setAlbumView(a.id)
  }

  return <section key={id} className="album-view artist-view" aria-label={`Artist: ${artist.name}`}>
    <header className="album-view-title">
      <CoverUpload id={artist.id} name={artist.name} image={artist.image} className="album-view-cover artist-view-photo" />
      <div className="album-view-names">
        <div className="album-view-artist">Artist</div>
        <h1 className="album-view-name">{artist.name}</h1>
        <div className="album-view-year">
          {loaded && <>{onTree.length} {onTree.length === 1 ? 'album' : 'albums'} · {rated.length} {rated.length === 1 ? 'song' : 'songs'} rated</>}
        </div>
      </div>
      {r.tier
        ? <div className="album-view-rating">
          <div className="album-view-grade" style={{ background: r.tier.color }}>{r.tier.name}</div>
          <div className="album-view-score">{r.label}</div>
        </div>
        : <div className="album-view-rating"><div className="album-view-score dim">Unrated</div></div>}
    </header>

    {loaded && <div className="artist-view-body">
      {rated.length > 0 && <section className="artist-view-section" aria-label="Songs by tier">
        <h2 className="artist-view-heading">Songs by tier</h2>
        <ol className="artist-tiers">
          {counts.map((c, i) => {
            const n = c.songs.length
            const show = (e: React.SyntheticEvent<HTMLLIElement>) => n && setHover({ tier: i, rect: e.currentTarget.getBoundingClientRect() })
            return <li key={c.name} className={`artist-tier${n ? '' : ' none'}${hover?.tier === i ? ' hovered' : ''}`}
              tabIndex={n ? 0 : undefined} onMouseEnter={show} onFocus={show}
              onMouseLeave={() => setHover(null)} onBlur={() => setHover(null)}>
              <span className="artist-tier-name">{c.name}</span>
              <span className="artist-tier-track">
                <span className="artist-tier-bar" style={{ width: `${(n / most) * 100}%`, background: c.color, animationDelay: `${0.3 + i * 0.03}s` }} />
              </span>
              <span className="artist-tier-count">{n || ''}</span>
            </li>
          })}
        </ol>
        {hover && counts[hover.tier]?.songs.length > 0 &&
          <TierSongs key={hover.tier} tier={counts[hover.tier]} rect={hover.rect} albumName={id => id ? s.albums[id]?.name : undefined}
            imageOf={t => (t.albumId ? albumCover(s.albums[t.albumId]) : undefined)} />}
      </section>}

      {career.length > 1 && <section className="artist-view-section">
        <AlbumChart tracks={career} title="Career" describe="Career: album scores in release order"
          xLabel={t => shortYear((t as ChartTrack & { year?: number }).year)} colorOf={albumGrade} format={formatAlbumScore} />
      </section>}

      <section className="artist-view-section" aria-label="Albums">
        <h2 className="artist-view-heading with-action">Albums
          {adding !== id && <button className="album-action" onClick={() => setAdding(id)}>ADD ALBUM</button>}</h2>
        {adding === id && <NewAlbum artistId={id} onClose={() => setAdding(null)} />}
        <ol className="av-albums">
          {albums.map(a => {
            const g = a.addedAt !== undefined ? ratingOf(s, a.id) : undefined
            return <li key={a.id}>
              <button className={`av-album${a.addedAt === undefined ? ' staged' : ''}`} onClick={() => open(a)}
                aria-label={a.addedAt === undefined ? `${a.name}: put on the rater` : `${a.name}, ${g?.tier ? `${g.label} (${g.tier.name})` : g?.label === INCOMPLETE ? 'incomplete' : 'unrated'}: album view`}>
                {albumCover(a) ? <img className="av-album-cover" src={albumCover(a)} alt="" draggable={false} /> : <span className="av-album-cover" />}
                <span className="av-album-name">{a.name}</span>
                <span className="av-album-year">{a.year ?? ''}</span>
                <span className={`av-album-score${g?.label === INCOMPLETE ? ' incomplete' : ''}`}>{g?.tier ? g.label : g?.label === INCOMPLETE ? 'Incomplete' : a.addedAt === undefined || a.misc ? '' : '—'}</span>
                <span className="av-album-grade" style={g?.tier ? { background: g.tier.color } : undefined}>{g?.tier?.name ?? ''}</span>
              </button>
            </li>
          })}
        </ol>
      </section>
    </div>}
  </section>
}

/** A tier's songs, best first, in a card beside its row (at most TIER_SONGS_MAX, then how many more). */
const TierSongs = ({ tier, rect, albumName, imageOf }: {
  tier: { name: string, color: string, songs: Track[] }, rect: DOMRect,
  albumName: (id?: string) => string | undefined, imageOf: (t: Track) => string | undefined,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  // Right of the row, its top level with the row's, kept on screen.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const y = Math.min(Math.max(12, rect.top - 8), window.innerHeight - el.offsetHeight - 12)
    el.style.transform = `translate(${Math.round(rect.right + 18)}px, ${Math.round(y)}px)`
    el.style.visibility = 'visible'
  }, [rect])
  const shown = tier.songs.slice(0, TIER_SONGS_MAX)
  const more = tier.songs.length - shown.length
  return createPortal(<div ref={ref} className="score-matches tier-songs" role="tooltip" aria-label={`${tier.name} songs`}>
    <div className="tier-songs-head"><span className="tier-songs-chip" style={{ background: tier.color }}>{tier.name}</span>
      <span className="tier-songs-count">{tier.songs.length} {tier.songs.length === 1 ? 'song' : 'songs'}</span></div>
    {shown.map(t => {
      const image = imageOf(t)
      return <div className="score-match" key={t.id}>
        {image ? <img className="score-match-thumb" src={image} alt="" draggable={false} /> : <span className="score-match-thumb" />}
        <span className="score-match-names">
          <span className="score-match-name">{t.name}</span>
          {albumName(t.albumId) && <span className="score-match-detail">{albumName(t.albumId)}</span>}
        </span>
        <span className="score-match-score">{formatScore(t.score!)}</span>
      </div>
    })}
    {more > 0 && <div className="tier-songs-more">and {more} more</div>}
  </div>, document.body)
}
