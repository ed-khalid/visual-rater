import { afterEach, describe, expect, test } from 'vitest'
import { compareBox } from './box'
import { isComparing, useView } from './view'

const initial = useView.getState()
afterEach(() => useView.setState(initial, true))

describe('compare', () => {
  test('Esc steps back: the picker, then compare, then album view; changing album ends it', () => {
    const v = () => useView.getState()
    v().setAlbumView('a')
    v().startCompare()
    expect(isComparing(v())).toBe(true)
    v().setCompareWith('b')
    v().setPicking(true)
    v().goBack()
    expect([v().picking, v().compareWith, v().comparing]).toEqual([false, 'b', true])
    v().goBack()
    expect([v().comparing, v().compareWith, v().albumView]).toEqual([false, null, 'a'])
    v().startCompare(); v().setCompareWith('b')
    v().setAlbumView('a') // the same album: compare stays
    expect(v().compareWith).toBe('b')
    v().setAlbumView('c')
    expect([v().comparing, v().compareWith]).toEqual([false, null])
  })

  test('with no album picked yet, Esc ends compare', () => {
    const v = () => useView.getState()
    v().setAlbumView('a'); v().startCompare()
    v().goBack()
    expect([v().comparing, v().albumView]).toEqual([false, 'a'])
  })

  test('one spine in the middle, each side\'s songs stopping short of its panel', () => {
    for (const w of [1024, 1280, 1440, 1920]) {
      const c = compareBox(w)
      expect(Math.abs(c.spine - w / 2)).toBeLessThanOrEqual(0.5)
      expect(c.spine - c.reach).toBeGreaterThan(c.edge + c.panel)
      expect(c.spine + c.reach).toBeLessThan(w - c.edge - c.panel)
    }
  })
})
