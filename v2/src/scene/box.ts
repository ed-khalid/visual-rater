import { useEffect, useState } from 'react'
import { isComparing, sidePanel, useView } from './view'

/** The page's measurements: where the rater stands, by the window's size and what's open. */
export const useBox = () => {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const panel = useView(sidePanel)
  const phone = size.w <= 640
  const top = phone ? 150 : 158, bottom = size.h - (phone ? 228 : 100)
  const wide = size.w >= 1200, desktop = size.w > 900
  /**
   * Kept clear on the left for the catalog (its full column on desktops, its covers alone on phones); a margin on the right.
   */
  const gutterLeft = desktop ? 300 : phone ? 60 : 16
  const gutter = phone ? 16 : 40
  // Album view and artist view: the panel takes the left half (beside the catalog on wide screens, in its place on
  // narrower ones); the rater moves over to the right of it. Phones: the title card is at the bottom instead.
  const spineX = panel && wide ? Math.round(size.w * 0.5 + 110)
    : panel && desktop ? Math.round(size.w * 0.56)
    // Phones: just right of the catalog's covers, everything on the right of it, where there's room for labels.
    : phone ? gutterLeft + 58
    : Math.round(size.w / 2)
  /**
   * The rater's area, left edge: clear of the catalog, or, with a panel open, just left of the scale's numbers. The
   * list view fills it (and runs to `gutter` from the right edge, from `top` down `height`).
   */
  const areaLeft = panel && desktop ? spineX - 70 : gutterLeft
  const comparing = useView(isComparing)
  return {
    ...size, phone, top, height: Math.max(160, bottom - top), spineX, gutter, gutterLeft, areaLeft, radius: phone ? 13 : 15,
    compare: comparing && desktop ? compareBox(size.w) : null,
  }
}

/** Compare's page margin on either side (px), and the room kept clear between the songs and either album's panel. */
const COMPARE_EDGE = 28, COMPARE_CLEAR = 24

/**
 * Compare (desktop): the two albums' panels at the page's outer edges (`panel` wide each), and between them one rater,
 * its spine in the middle (`spine`): the left album's songs hang to its left, the right album's to its right, each
 * reaching `reach` at most, short of its panel.
 */
export const compareBox = (w: number) => {
  const spine = Math.round(w / 2)
  const panel = Math.round(Math.max(270, Math.min(380, (spine - COMPARE_EDGE) * 0.5)))
  return { edge: COMPARE_EDGE, panel, spine, reach: Math.max(80, spine - COMPARE_EDGE - panel - COMPARE_CLEAR) }
}
