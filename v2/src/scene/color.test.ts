import { describe, expect, test } from 'vitest'
import { dominantColor, fromHex, glowColor, toHex, type RGB } from './color'

/** An RGBA pixel buffer made of runs of solid colour: [[colour, count], …]. */
const pixels = (...runs: [RGB | [number, number, number, number], number][]) => {
  const out: number[] = []
  for (const [c, n] of runs) for (let i = 0; i < n; i++) out.push(c[0], c[1], c[2], c.length === 4 ? c[3] : 255)
  return new Uint8ClampedArray(out)
}

describe('dominantColor', () => {
  test('a solid cover is its own colour', () => {
    expect(dominantColor(pixels([[200, 40, 40], 100]))).toEqual([200, 40, 40])
  })

  test('the largest area wins between two colourful ones', () => {
    expect(dominantColor(pixels([[200, 40, 40], 70], [[40, 60, 200], 30]))).toEqual([200, 40, 40])
  })

  test('a vivid area beats a somewhat larger grey one', () => {
    expect(dominantColor(pixels([[128, 128, 128], 55], [[230, 120, 20], 45]))).toEqual([230, 120, 20])
  })

  test('near-black is ignored when there is anything else', () => {
    expect(dominantColor(pixels([[5, 5, 8], 90], [[30, 180, 90], 10]))).toEqual([30, 180, 90])
  })

  test('an all-black cover is black; transparent pixels never count', () => {
    expect(dominantColor(pixels([[4, 4, 4], 100]))).toEqual([4, 4, 4])
    expect(dominantColor(pixels([[255, 0, 0, 0], 90], [[20, 200, 40], 10]))).toEqual([20, 200, 40])
  })

  test('similar shades are averaged together', () => {
    const [r, g, b] = dominantColor(pixels([[200, 40, 40], 50], [[204, 44, 36], 50]))
    expect([r, g, b]).toEqual([202, 42, 38])
  })
})

describe('glowColor', () => {
  const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  test('keeps the hue; dark and muddy colours are brightened and saturated', () => {
    const [r, g, b] = hex(glowColor([90, 10, 10])) // dark red
    expect(r).toBeGreaterThan(200)
    expect(g).toBeLessThan(110)
    expect(b).toBeLessThan(110)
  })

  test('pale colours aren\'t washed out to white', () => {
    const [r, g, b] = hex(glowColor([200, 230, 255])) // pale blue
    expect(b).toBeGreaterThan(r)
    expect(Math.min(r, g, b)).toBeLessThan(200)
  })

  test('colourless covers glow a soft white', () => {
    expect(glowColor([240, 240, 240])).toBe('#dfe8f0')
    expect(glowColor([30, 30, 32])).toBe('#dfe8f0')
  })
})

describe('hex', () => {
  test('round-trips, and rejects anything else', () => {
    expect(fromHex(toHex([214, 146, 92]))).toEqual([214, 146, 92])
    expect(fromHex('#D6925C')).toEqual([214, 146, 92])
    expect(fromHex('red')).toBeNull()
    expect(fromHex('#abc')).toBeNull()
  })
})
