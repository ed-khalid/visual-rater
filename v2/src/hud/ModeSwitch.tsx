import { useEffect, useRef } from 'react'
import { screenAnchors, TRUNK_TOP_ANCHOR, useView } from '../scene/view'
import './modeSwitch.css'

/** Gap between the top of the trunk and the switch (CSS px). */
const ABOVE_TRUNK_PX = 22
const EDGE_PX = 12

/**
 * TREE ⟷ LIST: a slider switch just above the top of the trunk, between the tree (the 3D rater) and the list view.
 * While the list is up the tree isn't drawn, so the switch stays where it last was.
 */
export const ModeSwitch = () => {
  const listing = useView(v => v.phase === 'to-list' || v.phase === 'list')
  const toggle = useView(v => v.toggleMode)
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let frame = 0, shown = ''
    const tick = () => {
      const a = screenAnchors.get(TRUNK_TOP_ANCHOR), el = ref.current
      if (a && el) {
        const y = Math.max(EDGE_PX, a.y - ABOVE_TRUNK_PX - el.offsetHeight)
        el.style.transform = `translate(${Math.round(a.x - el.offsetWidth / 2)}px, ${Math.round(y)}px)`
        el.style.visibility = a.visible || useView.getState().phase !== 'tree' ? 'visible' : 'hidden'
        // The list view starts below the switch (its height depends on the screen, through the camera distance).
        const bottom = `${Math.round(y + el.offsetHeight)}px`
        if (bottom !== shown) { shown = bottom; document.documentElement.style.setProperty('--mode-switch-bottom', bottom) }
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])

  return <button ref={ref} className="mode-switch" role="switch" aria-checked={listing} aria-label="List view" onClick={toggle}>
    <span className={`mode-switch-label${listing ? '' : ' on'}`}>TREE</span>
    <span className="mode-switch-track" aria-hidden="true"><span className="mode-switch-thumb" /></span>
    <span className={`mode-switch-label${listing ? ' on' : ''}`}>LIST</span>
  </button>
}
