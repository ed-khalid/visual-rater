import { useEffect, useMemo, useRef, useState } from 'react'
import type { Suggestion } from '../shared/suggestions'
import { albumStatus, usePersisted, useStore } from '../state/store'
import { loadAlbumDetails } from './albumDetails'
import { loadArtistsFor } from '../state/remote'
import './artistAlbums.css'

type Load = { status: 'loading' } | { status: 'error' } | { status: 'ready', albums: Suggestion[] }

/**
 * Picked an artist in the ADD palette: a checklist of their albums (from Spotify, one per album, oldest first) beside
 * the palette. Tick the ones you want and ADD stages them all at once, with their tracklists loading in the
 * background; the palette then closes and the first of them (the oldest) opens in album view (onAdded). Albums already in the catalog show where they are instead of a tick box. One of the
 * artist's albums under a different Spotify edition (same name, same artist) is marked IN CATALOG: still tickable,
 * since we never match by name, but left out of All so another edition isn't added by accident.
 * Lives inside the palette's dialog (so it can take clicks and focus), and keeps its keys to itself: arrows and
 * Enter don't reach the palette's list, and Esc closes only the checklist.
 */
export const ArtistAlbums = ({ artist, onClose, onAdded }: { artist: Suggestion, onClose: () => void, onAdded: (firstId: string) => void }) => {
  const [load, setLoad] = useState<Load>({ status: 'loading' })
  const [checked, setChecked] = useState<Set<string>>(() => new Set())
  const s = usePersisted()
  const addAlbum = useStore(st => st.addAlbum)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let live = true
    setLoad({ status: 'loading' }); setChecked(new Set())
    // Their albums already here load too, so the list can show where each one is.
    const here = loadArtistsFor([{ name: artist.name, vendor: { name: artist.provider, id: artist.id } }])
    fetch(`/api/music/artists/${encodeURIComponent(artist.id)}/albums`)
      .then(async res => { if (!res.ok) throw new Error(String(res.status)); return (await res.json()) as { albums: Suggestion[] } })
      .then(async body => { await here; if (live) setLoad({ status: 'ready', albums: body.albums }) })
      .catch(() => { if (live) setLoad({ status: 'error' }) })
    return () => { live = false }
  }, [artist.id])
  useEffect(() => { if (load.status === 'ready') root.current?.querySelector<HTMLElement>('input, button')?.focus() }, [load.status])

  const where = (a: Suggestion) => albumStatus(s, { name: a.provider, id: a.id })
  // Names of this artist's albums already in the catalog (any edition).
  const owned = useMemo(() => {
    const ids = new Set(Object.values(s.artists).filter(x => (x.vendor?.name === artist.provider && x.vendor.id === artist.id)
      || (!x.vendor && x.name.toLowerCase() === artist.name.toLowerCase())).map(x => x.id))
    return new Set(Object.values(s.albums).filter(a => a.artistId && ids.has(a.artistId)).map(a => a.name.toLowerCase()))
  }, [s, artist])
  const another = (a: Suggestion) => !where(a) && owned.has(a.name.toLowerCase())
  const free = useMemo(() => load.status === 'ready' ? load.albums.filter(a => !where(a)) : [], [load, s])
  const fresh = free.filter(a => !another(a))
  const allOn = fresh.length > 0 && fresh.every(a => checked.has(a.id))
  const flip = (id: string) => setChecked(c => { const n = new Set(c); if (!n.delete(id)) n.add(id); return n })

  const add = async () => {
    if (load.status !== 'ready') return
    const picked = free.filter(a => checked.has(a.id))
    // Albums credited to someone else: that artist's albums load first, so none is added twice.
    await loadArtistsFor(picked.filter(a => a.artistId && a.artistId !== artist.id && a.artist)
      .map(a => ({ name: a.artist!, vendor: { name: a.provider, id: a.artistId! } })))
    const ids: string[] = []
    for (const a of picked) {
      const mine = !a.artistId || a.artistId === artist.id
      const id = addAlbum({
        name: a.name,
        ...(a.image ? { image: a.image } : {}),
        vendor: { name: a.provider, id: a.id },
        ...(a.year !== undefined ? { year: a.year } : {}),
        artist: mine
          ? { name: artist.name, vendor: { name: artist.provider, id: artist.id }, ...(artist.image ? { image: artist.image } : {}) }
          : { name: a.artist ?? artist.name, ...(a.artistId ? { vendor: { name: a.provider, id: a.artistId } } : {}) },
      })
      if (id) ids.push(id)
    }
    // Tracklists one after another, so a long discography doesn't hit Spotify all at once.
    void ids.reduce((p, id) => p.then(() => loadAlbumDetails(id)), Promise.resolve())
    if (ids.length) onAdded(ids[0])
  }

  const n = free.filter(a => checked.has(a.id)).length
  return <div ref={root} className="artist-albums" role="dialog" aria-label={`${artist.name}: choose albums to add`}
    onKeyDown={e => { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); onClose() } }}>
    <div className="artist-albums-head">
      {artist.image ? <img className="artist-albums-avatar" src={artist.image} alt="" /> : <span className="artist-albums-avatar" />}
      <span className="artist-albums-name">{artist.name}</span>
      <button className="artist-albums-close" onClick={onClose} aria-label="Close">×</button>
    </div>
    {load.status === 'loading' && <div className="palette-hint">Loading albums…</div>}
    {load.status === 'error' && <div className="palette-hint">Couldn't load their albums right now.</div>}
    {load.status === 'ready' && load.albums.length === 0 && <div className="palette-hint">No albums found.</div>}
    {load.status === 'ready' && load.albums.length > 0 && <>
      {fresh.length > 1 && <label className="artist-albums-row artist-albums-all">
        <input type="checkbox" checked={allOn} onChange={() => setChecked(c => {
          const n = new Set(c)
          for (const a of fresh) { if (allOn) n.delete(a.id); else n.add(a.id) }
          return n
        })} />
        <span className="artist-albums-box" aria-hidden="true" />
        <span className="artist-albums-title">All</span>
      </label>}
      <ul className="artist-albums-list">
        {load.albums.map(a => {
          const at = where(a), dupe = another(a)
          return <li key={a.id}>
            <label className={`artist-albums-row${at ? ' taken' : ''}${dupe ? ' dupe' : ''}`}>
              <input type="checkbox" disabled={!!at} checked={!!at || checked.has(a.id)} onChange={() => flip(a.id)} />
              <span className="artist-albums-box" aria-hidden="true" />
              {a.image ? <img className="palette-thumb" src={a.image} alt="" /> : <span className="palette-thumb" />}
              <span className="artist-albums-title">{a.name}
                <span className="palette-detail">{[a.year, a.edition].filter(Boolean).join(' · ')}</span></span>
              {at && <span className="palette-tag">{at === 'added' ? 'ON BOARD' : 'STAGED'}</span>}
              {dupe && <span className="palette-tag">IN CATALOG</span>}
            </label>
          </li>
        })}
      </ul>
      <div className="artist-albums-actions">
        <button className="artist-albums-add" disabled={n === 0} onClick={add}>
          {n === 0 ? 'ADD' : `ADD ${n} ${n === 1 ? 'ALBUM' : 'ALBUMS'}`}
        </button>
      </div>
    </>}
  </div>
}
