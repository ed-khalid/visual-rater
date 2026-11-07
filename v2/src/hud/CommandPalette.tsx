import { Command } from 'cmdk'
import { ArtistAlbums } from './ArtistAlbums'
import { useEffect, useState } from 'react'
import type { Suggestion } from '../shared/suggestions'
import { albumStatus, nameTaken, usePersisted, useStore } from '../state/store'
import './palette.css'
import { loadAlbumDetails } from './albumDetails'
import { useSuggestions } from './useSuggestions'
import { useView } from '../scene/view'

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'

type Props = { open: boolean, onOpenChange: (open: boolean) => void }

/**
 * The single entry point for anything that isn't a gesture on the tree. For now: add something.
 * On MUSIC, Spotify artists and albums are suggested as you type. An album goes to the staging tray; an artist opens
 * a checklist of their albums (ArtistAlbums) to add several at once. The typed text can always be added as-is: a
 * track on MUSIC, a movie or book.
 */
export const CommandPalette = ({ open, onOpenChange }: Props) => {
  const [query, setQuery] = useState('')
  /** The highlighted row (cmdk value). Controlled so the top suggestion is highlighted when results arrive. */
  const [selected, setSelected] = useState('')
  const addTypedItem = useStore(s => s.addTyped)
  const addAlbum = useStore(s => s.addAlbum)
  const typeId = useStore(s => s.activeType ?? undefined)
  const s = usePersisted()
  const name = query.trim()
  const duplicate = name !== '' && !!typeId && nameTaken(s, typeId, name)
  const onBoard = (sg: Suggestion) => albumStatus(s, { name: sg.provider, id: sg.id })
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

  // Highlight the best match once it arrives, so Enter picks it; until then, the typed text.
  const firstFree = suggestions.results.find(sg => sg.kind === 'artist' || !onBoard(sg))
  const preferred = firstFree ? `sg:${firstFree.kind}:${firstFree.id}` : name !== '' && !duplicate ? `add:${name}` : ''
  useEffect(() => { setSelected(preferred) }, [preferred])

  // Stay open after adding, so several things can be added in a row.
  const addTyped = () => {
    const id = addTypedItem(name)
    if (!id) return
    setQuery('')
    useView.getState().startRating([id])
  }
  // Back to the search box when the checklist closes.
  const closeArtist = () => { setArtist(null); document.querySelector<HTMLElement>('.palette-input')?.focus() }
  // Albums wait in the staging tray; an artist opens the checklist of their albums.
  const addSuggestion = (sg: Suggestion) => {
    if (sg.kind === 'artist') return setArtist(sg)
    const added = addAlbum({
      name: sg.name,
      ...(sg.image ? { image: sg.image } : {}),
      vendor: { name: sg.provider, id: sg.id },
      ...(sg.year !== undefined ? { year: sg.year } : {}),
      ...(sg.artist ? { artist: { name: sg.artist, ...(sg.artistId ? { vendor: { name: sg.provider, id: sg.artistId } } : {}) } } : {}),
    })
    if (!added) return
    setQuery('')
    // An album comes with its tracklist: fetch it now, so it's ready when the album is opened.
    void loadAlbumDetails(added)
  }

  return <Command.Dialog open={open} onOpenChange={onOpenChange} label="Command palette" className="palette" overlayClassName="palette-overlay" shouldFilter={false} loop value={selected} onValueChange={setSelected}>
    <button className="palette-close" onClick={() => onOpenChange(false)} aria-label="Close">×</button>
    <Command.Input value={query} onValueChange={setQuery} placeholder={searchable ? 'Add artists or albums…' : 'Add an item…'} className="palette-input" autoFocus />
    <Command.List className="palette-list">
      {suggestions.results.map(sg => {
        const taken = sg.kind === 'album' ? onBoard(sg) : false
        return <Command.Item key={`${sg.kind}:${sg.id}`} value={`sg:${sg.kind}:${sg.id}`} onSelect={() => addSuggestion(sg)} disabled={taken !== false} className="palette-item palette-suggestion" data-kind={sg.kind}>
          {sg.image ? <img className="palette-thumb" src={sg.image} alt="" /> : <span className="palette-thumb" />}
          <span className="palette-name">{sg.name}{(sg.edition || sg.detail) && <span className="palette-detail">{[sg.edition, sg.detail].filter(Boolean).join(' · ')}</span>}</span>
          <span className="palette-tag">{taken === 'added' ? 'ON BOARD' : taken === 'staged' ? 'STAGED' : sg.kind === 'artist' ? 'ARTIST' : 'ALBUM'}</span>
        </Command.Item>
      })}

      {name !== '' && searchable && suggestions.status === 'loading' && suggestions.results.length === 0 && <div className="palette-hint">Searching…</div>}
      {name !== '' && searchable && suggestions.status === 'error' && <div className="palette-hint">Suggestions unavailable right now.</div>}

      {name !== '' && !duplicate &&
        <Command.Item value={`add:${name}`} onSelect={addTyped} className="palette-item">
          <span className="palette-verb">ADD</span>{name}{searchable && <span className="palette-detail">as typed</span>}
        </Command.Item>}
      {duplicate && <div className="palette-hint">“{name}” is already on this board.</div>}
    </Command.List>
    {artist && <ArtistAlbums artist={artist} onClose={closeArtist} onAdded={() => { closeArtist(); setQuery('') }} />}
  </Command.Dialog>
}
