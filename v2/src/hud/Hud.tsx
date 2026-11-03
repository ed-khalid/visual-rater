import { useState } from 'react'
import { useStore } from '../state/store'
import { CommandPalette, shortcutLabel } from './CommandPalette'
import { StagingTray } from './StagingTray'
import { TypePicker } from './TypePicker'
import './hud.css'

/** The only DOM UI: corner readouts, the type picker when no board is open, and the command palette. */
export const Hud = () => {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const board = useStore(s => s.activeBoardId ? s.boards[s.activeBoardId] : null)
  const count = useStore(s => s.placements.filter(p => p.boardId === s.activeBoardId).length)
  const closeBoard = useStore(s => s.closeBoard)

  return <>
    {!board && <TypePicker />}
    {board && <StagingTray />}
    <div className="hud">
      {board
        ? <button className="hud-tl hud-home" onClick={closeBoard} title="Back to types">VISUAL&nbsp;RATER <span className="dim">// v2</span></button>
        : <div className="hud-tl">VISUAL&nbsp;RATER <span className="dim">// v2</span></div>}
      {board && <>
        <div className="hud-tr dim">{board.name}</div>
        <div className="hud-bl dim">{String(count).padStart(3, '0')} ITEMS</div>
        <button className="hud-key" onClick={() => setPaletteOpen(true)} title={`Add an item (${shortcutLabel})`} aria-label="Add an item">
          {/* An invisible "ADD" keeps the button its original width; the + sits centred over it. */}
          <span className="hud-key-sizer" aria-hidden="true">ADD</span>
          <span className="hud-key-glyph" aria-hidden="true">+</span>
        </button>
      </>}
    </div>
    {board && <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />}
  </>
}
