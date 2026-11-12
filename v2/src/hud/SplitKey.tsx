import { useView } from '../scene/view'
import { useStore } from '../state/store'

/**
 * The split view key (view.split: a rater per album), top right under the rule, MUSIC only, hidden in the list view.
 * Not shown for now: the button is off the page while it's being re-purposed, but split view itself still works
 * (state/split.ts, scene/Board.tsx), and rendering <SplitKey /> in Hud's corner keys brings it back.
 */
export const SplitKey = () => {
  const music = useStore(s => s.activeType === 'music')
  const listing = useView(s => s.phase !== 'tree')
  const split = useView(s => s.split)
  const setSplit = useView(s => s.setSplit)
  if (!music || listing) return null
  return <button className={`hud-key hud-split${split ? ' on' : ''}`} onClick={() => setSplit(!split)}
    title={split ? 'One tree' : 'A rater per album'} aria-label="A rater per album" aria-pressed={split}>
    <span className="hud-key-sizer" aria-hidden="true">ADD</span>
    <span className="hud-key-glyph" aria-hidden="true">
      {/* one trunk, or three apart */}
      <svg width="13" height="11" viewBox="0 0 13 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        {split ? <><path d="M2 1v9" /><path d="M6.5 1v9" /><path d="M11 1v9" /></>
          : <><path d="M6.5 1v9" /><path d="M6.5 4h4" /><path d="M6.5 7h-4" /></>}
      </svg>
    </span>
  </button>
}
