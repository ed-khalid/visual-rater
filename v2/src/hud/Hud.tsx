import { useEffect, useState } from 'react'
import { useView } from '../scene/view'
import { TYPES } from '../shared/model'
import { useCounts } from '../state/remote'
import { useStore } from '../state/store'
import { DragScore, ItemHoverCard } from './AlbumOverlays'
import { ScoreMatches } from './ScoreMatches'
import { AlbumView } from './AlbumView'
import { ArtistView } from './ArtistView'
import { CommandPalette, shortcutLabel } from './CommandPalette'
import { ListView } from './ListView'
import { ModeSwitch } from './ModeSwitch'
import { Breadcrumb } from './Breadcrumb'
import { Catalog } from './Catalog'
import { LibraryLoader } from './LibraryLoader'
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
  // MUSIC: how many artists, albums and songs are saved, a line each; the other types (all loaded): their items.
  const music = useCounts(c => c.music)
  const items = useStore(s => s.activeType && s.activeType !== 'music' ? Object.keys(s[s.activeType]).length : 0)
  const counts = activeType === 'music' ? music ?? {} : { items }
  const closeBoard = useStore(s => s.closeBoard)
  const phase = useView(s => s.phase)
  const listing = phase !== 'tree'
  const albumView = useView(s => s.albumView)
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
        <dl className="hud-bl">
          {Object.entries(counts).map(([k, n]) => <div key={k} className="hud-count-line">
            <dt className="hud-count" key={n}>{n}</dt> <dd>{n === 1 ? k.slice(0, -1) : k}</dd>
          </div>)}
        </dl>
        <button className="hud-key" onClick={() => setPaletteOpen(true)} title={`Add an item (${shortcutLabel})`} aria-label="Add an item">
          {/* An invisible "ADD" keeps the button its original width; the + sits centred over it. */}
          <span className="hud-key-sizer" aria-hidden="true">ADD</span>
          <span className="hud-key-glyph" aria-hidden="true">+</span>
        </button>
      </>}
    </div>
    {activeType === 'music' && <Rubric />}
    {/* album view is always on the tree, so no TREE ⟷ LIST there */}
    {board && !albumView && <ModeSwitch />}
    {board && <RatingWatch />}
    {board && listing && <ListView />}
    {activeType === 'music' && <LibraryLoader />}
    {/* The list view takes the rater's place only: what's around it stays. */}
    {board && activeType === 'music' && <><Catalog /><Breadcrumb /><AlbumView /><ArtistView /></>}
    {board && activeType === 'music' && <ZoomSwitch />}
    {board && !listing && <><ItemHoverCard /><DragScore /><ScoreMatches /></>}
    {board && <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />}
  </>
}
