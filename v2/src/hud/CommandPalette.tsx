import { Command } from 'cmdk'
import { useEffect, useState } from 'react'
import type { Suggestion } from '../shared/suggestions'
import { isOnActiveBoard, sourceStatusOnActiveBoard, useStore } from '../state/store'
import './palette.css'
import { loadAlbumDetails } from './albumDetails'
import { useSuggestions } from './useSuggestions'

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'

type Props = { open: boolean, onOpenChange: (open: boolean) => void }

/**
 * The single entry point for anything that isn't a gesture on the board. For now: add an item.
 * Where the board's type has a catalogue (MUSIC → Spotify artists and albums), matches are suggested as you type;
 * the typed text can always be added as-is.
 */
export const CommandPalette = ({ open, onOpenChange }: Props) => {
  const [query, setQuery] = useState('')
  /** The highlighted row (cmdk value). Controlled so the top suggestion is highlighted when results arrive. */
  const [selected, setSelected] = useState('')
  const addItem = useStore(s => s.addItem)
  const typeId = useStore(s => s.activeBoardId ? s.boards[s.activeBoardId]?.typeId : undefined)
  const name = query.trim()
  const duplicate = useStore(s => name !== '' && isOnActiveBoard(s, name))
  // Select plain data (stable references), then check against it; a selector returning a new function would re-render forever.
  const placements = useStore(s => s.placements)
  const items = useStore(s => s.items)
  const activeBoardId = useStore(s => s.activeBoardId)
  const staged = useStore(s => s.staged)
  const onBoard = (sg: Suggestion) => sourceStatusOnActiveBoard({ ...useStore.getState(), placements, staged, items, activeBoardId }, { provider: sg.provider, kind: sg.kind, id: sg.id })
  const suggestions = useSuggestions(open ? typeId : undefined, query)
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

  useEffect(() => { if (!open) setQuery('') }, [open])

  // Highlight the best match once it arrives, so Enter picks it; until then, the typed text.
  const firstFree = suggestions.results.find(sg => !onBoard(sg))
  const preferred = firstFree ? `sg:${firstFree.kind}:${firstFree.id}` : name !== '' && !duplicate ? `add:${name}` : ''
  useEffect(() => { setSelected(preferred) }, [preferred])

  // Stay open after adding, so several items can be added in a row.
  const addTyped = () => { if (addItem(name)) setQuery('') }
  // Albums wait in the staging tray; everything else goes straight onto the axis.
  const addSuggestion = (sg: Suggestion) => {
    const added = addItem(sg.name, { image: sg.image, artist: sg.artist, year: sg.year, source: { provider: sg.provider, kind: sg.kind, id: sg.id } }, { stage: sg.kind === 'album' })
    if (!added) return
    setQuery('')
    // An album comes with its tracklist: fetch it now, so it's ready when the album is opened.
    if (sg.kind === 'album') void loadAlbumDetails(added.id)
  }

  return <Command.Dialog open={open} onOpenChange={onOpenChange} label="Command palette" className="palette" overlayClassName="palette-overlay" shouldFilter={false} loop value={selected} onValueChange={setSelected}>
    <button className="palette-close" onClick={() => onOpenChange(false)} aria-label="Close">×</button>
    <Command.Input value={query} onValueChange={setQuery} placeholder={searchable ? 'Add artists or albums…' : 'Add an item…'} className="palette-input" autoFocus />
    <Command.List className="palette-list">
      {suggestions.results.map(sg => {
        const taken = onBoard(sg)
        return <Command.Item key={`${sg.kind}:${sg.id}`} value={`sg:${sg.kind}:${sg.id}`} onSelect={() => addSuggestion(sg)} disabled={taken !== false} className="palette-item palette-suggestion" data-kind={sg.kind}>
          {sg.image ? <img className="palette-thumb" src={sg.image} alt="" /> : <span className="palette-thumb" />}
          <span className="palette-name">{sg.name}{sg.detail && <span className="palette-detail">{sg.detail}</span>}</span>
          <span className="palette-tag">{taken === 'placed' ? 'ON BOARD' : taken === 'staged' ? 'STAGED' : sg.kind.toUpperCase()}</span>
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
  </Command.Dialog>
}
