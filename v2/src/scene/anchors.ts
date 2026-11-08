import { useEffect } from 'react'
import { screenAnchors } from './view'

type Anchor = { x: number, y: number, r: number, visible: boolean }

/**
 * Things on the board that overlays pin themselves to (the hover card, popups, the trash icon, the drop target), by
 * screenAnchors key: each says where it is right now. One loop (useAnchorLoop, run by the board) asks them all every
 * frame and writes screenAnchors, so overlays follow pieces through their animations.
 */
const sources = new Map<string, () => Anchor | null>()

/** An element's centre and half its width, if it's on screen and not faded right out. */
export const anchorOfElement = (el: Element | null): Anchor | null => {
  if (!el || !el.isConnected) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return null
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2, visible: true }
}

export const registerAnchor = (key: string, source: () => Anchor | null) => {
  sources.set(key, source)
  return () => { if (sources.get(key) === source) { sources.delete(key); screenAnchors.delete(key) } }
}

/** Publishes an element (by ref) as an anchor for as long as the component is mounted. */
export const useAnchor = (key: string, ref: { current: Element | null }) => {
  useEffect(() => registerAnchor(key, () => anchorOfElement(ref.current)), [key, ref])
}

export const useAnchorLoop = () => {
  useEffect(() => {
    let frame = 0
    const tick = () => {
      for (const [key, source] of sources) {
        const a = source()
        if (a) screenAnchors.set(key, a)
        else screenAnchors.delete(key)
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])
}
