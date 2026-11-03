import { Command } from 'cmdk'
import { useEffect, useState } from 'react'
import { isOnActiveBoard, useStore } from '../state/store'
import './palette.css'

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
export const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'

type Props = { open: boolean, onOpenChange: (open: boolean) => void }

/** The single entry point for anything that isn't a gesture on the board. For now: add an item. */
export const CommandPalette = ({ open, onOpenChange }: Props) => {
  const [query, setQuery] = useState('')
  const addItem = useStore(s => s.addItem)
  const name = query.trim()
  const duplicate = useStore(s => name !== '' && isOnActiveBoard(s, name))

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

  const add = () => {
    if (addItem(name)) setQuery('')  // stay open so several items can be added in a row
  }

  return <Command.Dialog open={open} onOpenChange={onOpenChange} label="Command palette" className="palette" overlayClassName="palette-overlay" shouldFilter={false} loop>
    <button className="palette-close" onClick={() => onOpenChange(false)} aria-label="Close">×</button>
    <Command.Input value={query} onValueChange={setQuery} placeholder="Add an item…" className="palette-input" autoFocus />
    <Command.List className="palette-list">
      {name === '' && <div className="palette-hint">Type a name, then Enter. Esc to close.</div>}
      {name !== '' && !duplicate &&
        <Command.Item value={`add:${name}`} onSelect={add} className="palette-item">
          <span className="palette-verb">ADD</span>{name}
        </Command.Item>}
      {duplicate && <div className="palette-hint">“{name}” is already on this board.</div>}
    </Command.List>
  </Command.Dialog>
}
