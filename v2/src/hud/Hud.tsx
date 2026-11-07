import { useState } from 'react'
import { useView } from '../scene/view'
import { TYPES } from '../shared/model'
import { treeNodes } from '../state/board'
import { useStore } from '../state/store'
import { AlbumPopup, DragScore, ItemHoverCard, ItemTrash } from './AlbumOverlays'
import { ScoreMatches } from './ScoreMatches'
import { AlbumView } from './AlbumView'
import { CommandPalette, shortcutLabel } from './CommandPalette'
import { ListView } from './ListView'
import { ModeSwitch } from './ModeSwitch'
import { Catalog } from './Catalog'
import { RaterContents } from './RaterContents'
import { StagedList } from './StagedList'
import { RatingWatch } from './RatingWatch'
import { Rubric } from './Rubric'
import { TypePicker } from './TypePicker'
import './hud.css'

/** The only DOM UI: corner readouts, the type picker when no board is open, and the command palette. */
export const Hud = () => {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const activeType = useStore(s => s.activeType)
  const board = activeType ? TYPES.find(t => t.id === activeType) ?? null : null
  const count = useStore(s => s.activeType ? treeNodes(s, s.activeType).length : 0)
  const closeBoard = useStore(s => s.closeBoard)
  const requestReset = useView(s => s.requestReset)
  const flattenBoard = useStore(s => s.flattenBoard)
  // Reset: the camera glides home and every branch swings onto the main plane, left or right of the trunk.
  const resetView = () => { flattenBoard(); requestReset() }
  const phase = useView(s => s.phase)
  const listing = phase !== 'tree'

  return <>
    {!board && <TypePicker />}
    <div className="hud">
      {board
        ? <button className="hud-tl hud-home" onClick={closeBoard} title="Back to types">VISUAL&nbsp;RATER <span className="dim">// v2</span></button>
        : <div className="hud-tl">VISUAL&nbsp;RATER <span className="dim">// v2</span></div>}
      {board && <>
        <div className="hud-tr dim">{board.name}</div>
        {!listing && <button className="hud-key hud-reset" onClick={resetView} title="Reset" aria-label="Reset view and layout">
          {/* Same box as the + button: an invisible "ADD" sets the width, the icon sits centred over it. */}
          <span className="hud-key-sizer" aria-hidden="true">ADD</span>
          <span className="hud-key-glyph" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.5 8a5.5 5.5 0 1 1-1.8-4.07" />
              <path d="M12.2 1.2v3.1H9.1" />
            </svg>
          </span>
        </button>}
        <div className="hud-bl dim">{String(count).padStart(3, '0')} ITEMS</div>
        <button className="hud-key" onClick={() => setPaletteOpen(true)} title={`Add an item (${shortcutLabel})`} aria-label="Add an item">
          {/* An invisible "ADD" keeps the button its original width; the + sits centred over it. */}
          <span className="hud-key-sizer" aria-hidden="true">ADD</span>
          <span className="hud-key-glyph" aria-hidden="true">+</span>
        </button>
      </>}
    </div>
    {activeType === 'music' && <Rubric />}
    {board && <ModeSwitch />}
    {board && <RatingWatch />}
    {board && listing && <ListView />}
    {board && !listing && <RaterContents />}
    {board && !listing && activeType === 'music' && <><StagedList /><Catalog /><AlbumView /></>}
    {board && !listing && <><ItemHoverCard /><DragScore /><ScoreMatches /><AlbumPopup /><ItemTrash /></>}
    {board && <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />}
  </>
}
