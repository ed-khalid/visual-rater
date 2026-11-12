import { Command } from 'cmdk'
import { ArtistAlbums } from './ArtistAlbums'
import { useEffect, useState } from 'react'
import type { Suggestion } from '../shared/suggestions'
import { albumStatus, nameTaken, usePersisted, useStore } from '../state/store'
import './palette.css'
import { addStagedAlbum } from './albumDetails'
import { useSuggestions } from './useSuggestions'
import { useView } from '../scene/view'
import { findArtists, loadArtistsFor } from '../state/remote'

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'

type Props = { open: boolean, onOpenChange: (open: boolean) => void }

/**
 * The single entry point for anything that isn't a gesture on the tree. For now: add something.
 * On MUSIC, Spotify artists, albums and songs are suggested as you type. An album is added, the palette closes and
 * album view opens on it; an artist opens a checklist of their albums (ArtistAlbums) to add several at once, and the
 * first of them opens the same way; a song goes on its album if that's in the
 * catalog, otherwise on the artist's Misc album (store.addSong), and album view opens on it to rate it. The typed text can always be added as-is: a
 * movie or book; on MUSIC, an artist (the one by that name, if they're here already, loaded or not), whose overview
 * opens, where albums can be made by hand (NewAlbum).
 */
export const CommandPalette = ({ open, onOpenChange }: Props) => {
  const [query, setQuery] = useState('')
  /** The highlighted row (cmdk value). Controlled so the top suggestion is highlighted when results arrive. */
  const [selected, setSelected] = useState('')
  const addTypedItem = useStore(s => s.addTyped)
  const addAlbum = useStore(s => s.addAlbum)
  const addSong = useStore(s => s.addSong)
  const addArtist = useStore(s => s.addArtist)
  const typeId = useStore(s => s.activeType ?? undefined)
  const s = usePersisted()
  const name = query.trim()
  // On MUSIC the form checks: a song can share a name with one by someone else.
  const duplicate = name !== '' && !!typeId && typeId !== 'music' && nameTaken(s, typeId, name)
  const onBoard = (sg: Suggestion) => sg.kind === 'track'
    ? Object.values(s.tracks).some(t => t.vendor?.name === sg.provider && t.vendor.id === sg.id && t.branch && !t.hidden) && 'added' as const
    : albumStatus(s, { name: sg.provider, id: sg.id })
  const found = useSuggestions(open ? typeId : undefined, query)
  const suggestions = found
  /** The artist whose albums are being picked (ArtistAlbums), if any. */
  const [artist, setArtist] = useState<Suggestion | null>(null)
  const searchable = typeId === 'music'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  useEffect(() => { if (!open) { setQuery(''); setArtist(null) } }, [open])

  // The artists suggested (or whose albums are), if they're here, load their albums, so the list shows which are in.
  useEffect(() => {
    void loadArtistsFor(suggestions.results.flatMap(sg => sg.kind === 'artist' ? [{ name: sg.name, vendor: { name: sg.provider, id: sg.id } }]
      : sg.artist ? [{ name: sg.artist, ...(sg.artistId ? { vendor: { name: sg.provider, id: sg.artistId } } : {}) }] : []))
  }, [suggestions.results])

  // Highlight the best match once it arrives, so Enter picks it; until then, the typed text.
  const firstFree = suggestions.results.find(sg => sg.kind === 'artist' || !onBoard(sg))
  const preferred = firstFree ? `sg:${firstFree.kind}:${firstFree.id}` : name !== '' && !duplicate ? `add:${name}` : ''
  useEffect(() => { setSelected(preferred) }, [preferred])

  // Stay open after adding, so several things can be added in a row.
  const addTyped = async () => {
    // On MUSIC: an artist (theirs, if one by that name is here, loaded or not), and their overview opens.
    if (searchable) {
      await findArtists({ names: [name] })
      const id = addArtist(name)
      if (!id) return
      onOpenChange(false)
      const v = useView.getState()
      v.setAlbumView(null); v.setSplit(false); v.setDrill(id)
      return
    }
    const id = addTypedItem(name)
    if (!id) return
    setQuery('')
    useView.getState().startRating([id])
  }
  // Back to the search box when the checklist closes.
  const closeArtist = () => { setArtist(null); document.querySelector<HTMLElement>('.palette-input')?.focus() }
  // An album just added: the palette closes and it goes on the tree, in album view (once its tracklist is in).
  const openAdded = (albumId: string) => {
    onOpenChange(false)
    useView.getState().setSplit(false)
    void addStagedAlbum(albumId)
  }
  // An artist opens the checklist of their albums.
  const addSuggestion = async (sg: Suggestion) => {
    if (sg.kind === 'artist') return setArtist(sg)
    const artistRef = sg.artist ? { name: sg.artist, ...(sg.artistId ? { vendor: { name: sg.provider, id: sg.artistId } } : {}) } : undefined
    // Their albums first, if they're here, so this one isn't added twice.
    if (artistRef) await loadArtistsFor([artistRef])
    if (sg.kind === 'track') {
      if (!artistRef) return
      const place = addSong({
        name: sg.name, vendor: { name: sg.provider, id: sg.id }, artist: artistRef,
        ...(sg.image ? { image: sg.image } : {}), ...(sg.durationMs !== undefined ? { durationMs: sg.durationMs } : {}),
        ...(sg.albumId ? { album: { name: sg.provider, id: sg.albumId } } : {}),
      })
      if (!place) return
      setQuery('')
      // Rated in album view: its own album (put on the tree first if it was staged), or Misc.
      if (place.staged) await addStagedAlbum(place.albumId)
      else { const v = useView.getState(); v.setSplit(false); v.setAlbumView(place.albumId) }
      return
    }
    const added = addAlbum({
      name: sg.name,
      ...(sg.image ? { image: sg.image } : {}),
      vendor: { name: sg.provider, id: sg.id },
      ...(sg.year !== undefined ? { year: sg.year } : {}),
      ...(artistRef ? { artist: artistRef } : {}),
    })
    if (!added) return
    openAdded(added)
  }

  return <Command.Dialog open={open} onOpenChange={onOpenChange} label="Command palette" className="palette" overlayClassName="palette-overlay" shouldFilter={false} loop value={selected} onValueChange={setSelected}>
    <button className="palette-close" onClick={() => onOpenChange(false)} aria-label="Close">×</button>
    <Command.Input value={query} onValueChange={setQuery} placeholder={searchable ? 'Add artists or albums…' : 'Add an item…'} className="palette-input" autoFocus />
    <Command.List className="palette-list">
      {suggestions.results.map(sg => {
        const taken = sg.kind !== 'artist' ? onBoard(sg) : false
        return <Command.Item key={`${sg.kind}:${sg.id}`} value={`sg:${sg.kind}:${sg.id}`} onSelect={() => void addSuggestion(sg)} disabled={taken !== false} className="palette-item palette-suggestion" data-kind={sg.kind}>
          {sg.image ? <img className="palette-thumb" src={sg.image} alt="" /> : <span className="palette-thumb" />}
          <span className="palette-name">{sg.name}{(sg.edition || sg.detail) && <span className="palette-detail">{[sg.edition, sg.detail].filter(Boolean).join(' · ')}</span>}</span>
          <span className="palette-tag">{taken === 'added' ? 'ON BOARD' : taken === 'staged' ? 'STAGED' : sg.kind === 'artist' ? 'ARTIST' : sg.kind === 'track' ? 'SONG' : 'ALBUM'}</span>
        </Command.Item>
      })}

      {name !== '' && searchable && suggestions.status === 'loading' && suggestions.results.length === 0 && <div className="palette-hint">Searching…</div>}
      {name !== '' && searchable && suggestions.status === 'error' && <div className="palette-hint">Suggestions unavailable right now.</div>}

      {name !== '' && !duplicate &&
        <Command.Item value={`add:${name}`} onSelect={() => void addTyped()} className="palette-item">
          <span className="palette-verb">ADD</span>{name}{searchable && <span className="palette-detail">as an artist</span>}
        </Command.Item>}
      {duplicate && <div className="palette-hint">“{name}” is already on this board.</div>}
    </Command.List>
    {artist && <ArtistAlbums artist={artist} onClose={closeArtist} onAdded={openAdded} />}
  </Command.Dialog>
}
