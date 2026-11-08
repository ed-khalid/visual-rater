import { useEffect, useState } from 'react'
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
import { Breadcrumb } from './Breadcrumb'
import { Catalog } from './Catalog'
import { StagedList } from './StagedList'
import { ActionLog } from './ActionLog'
import { RatingWatch } from './RatingWatch'
import { Rubric } from './Rubric'
import { TypePicker } from './TypePicker'
import { ZoomSwitch } from './ZoomSwitch'
import './hud.css'

/** The only DOM UI: corner readouts, the type picker when no board is open, and the command palette. */
export const Hud = () => {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const activeType = useStore(s => s.activeType)
  const board = activeType ? TYPES.find(t => t.id === activeType) ?? null : null
  const count = useStore(s => s.activeType ? treeNodes(s, s.activeType).length : 0)
  const closeBoard = useStore(s => s.closeBoard)
  const requestReset = useView(s => s.requestReset)
  // Reset: back to the artists, and in split view the raters go back into their order and the row to its start.
  const resetView = () => { useView.getState().setRaterOrder(null); useView.getState().setDrill(null); requestReset() }
  const phase = useView(s => s.phase)
  const listing = phase !== 'tree'
  const split = useView(s => s.split)
  const setSplit = useView(s => s.setSplit)
  // Split view is MUSIC's, and only for the tree that's open.
  useEffect(() => { const v = useView.getState(); v.setSplit(false); v.setRaterOrder(null); v.setDrill(null) }, [activeType])

  return <>
    {!board && <TypePicker />}
    <div className="hud">
      {board
        ? <button className="hud-tl hud-home" onClick={closeBoard} title="Back to contents">Visual Rater</button>
        : <div className="hud-tl">Visual Rater</div>}
      <div className="hud-rule" aria-hidden="true" />
      {board && <>
        <div className="hud-tr" key={board.id}>{board.name.toLowerCase()}</div>
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
        {!listing && activeType === 'music' && <button className={`hud-key hud-split${split ? ' on' : ''}`} onClick={() => setSplit(!split)}
          title={split ? 'One tree' : 'A rater per album'} aria-label="A rater per album" aria-pressed={split}>
          <span className="hud-key-sizer" aria-hidden="true">ADD</span>
          <span className="hud-key-glyph" aria-hidden="true">
            {/* one trunk, or three apart */}
            <svg width="13" height="11" viewBox="0 0 13 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              {split ? <><path d="M2 1v9" /><path d="M6.5 1v9" /><path d="M11 1v9" /></>
                : <><path d="M6.5 1v9" /><path d="M6.5 4h4" /><path d="M6.5 7h-4" /></>}
            </svg>
          </span>
        </button>}
        <div className="hud-bl"><span className="hud-count" key={count}>{count}</span> {count === 1 ? 'item' : 'items'}</div>
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
    {board && !listing && activeType === 'music' && <><StagedList /><Catalog /><Breadcrumb /><AlbumView /><ActionLog /><ZoomSwitch /></>}
    {board && !listing && <><ItemHoverCard /><DragScore /><ScoreMatches /><AlbumPopup /><ItemTrash /></>}
    {board && <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />}
  </>
}
