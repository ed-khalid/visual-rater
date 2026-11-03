/** Picking a cover's dominant colour, and turning it into a colour that glows well. Pure functions. */

export type RGB = [number, number, number]

/** Pixels darker than this (0–255 max channel) are ignored, unless almost the whole cover is that dark. */
const DARK = 30
/** Grid cells per channel when grouping similar pixels (16 → 4096 groups). */
const LEVELS = 16

/**
 * The cover's dominant colour, from its RGBA pixels (as from getImageData). Similar pixels are grouped; each group
 * scores by its pixel count, weighted towards colourful pixels so a vivid area beats an equally large grey one;
 * near-black and transparent pixels don't count (unless there's nothing else). Returns the average colour of the
 * winning group.
 */
export const dominantColor = (pixels: Uint8ClampedArray | number[]): RGB => {
  const pick = (skipDark: boolean): RGB | null => {
    const groups = new Map<number, { score: number, r: number, g: number, b: number, n: number }>()
    for (let i = 0; i + 3 < pixels.length; i += 4) {
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3]
      if (a < 128) continue
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      if (skipDark && max < DARK) continue
      const key = ((r * LEVELS) >> 8) * LEVELS * LEVELS + ((g * LEVELS) >> 8) * LEVELS + ((b * LEVELS) >> 8)
      const chroma = (max - min) / 255
      const group = groups.get(key) ?? { score: 0, r: 0, g: 0, b: 0, n: 0 }
      group.score += 0.35 + chroma
      group.r += r; group.g += g; group.b += b; group.n++
      groups.set(key, group)
    }
    let best: { score: number, r: number, g: number, b: number, n: number } | null = null
    for (const group of groups.values()) if (!best || group.score > best.score) best = group
    return best ? [Math.round(best.r / best.n), Math.round(best.g / best.n), Math.round(best.b / best.n)] : null
  }
  return pick(true) ?? pick(false) ?? [0, 0, 0]
}

const toHsl = ([r, g, b]: RGB): [number, number, number] => {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === rn ? ((gn - bn) / d + (gn < bn ? 6 : 0)) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4
  return [h / 6, s, l]
}

const fromHsl = ([h, s, l]: [number, number, number]): RGB => {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v] }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q
  const hue = (t: number) => {
    t = (t + 1) % 1
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p
  }
  return [Math.round(hue(h + 1 / 3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1 / 3) * 255)]
}

export const toHex = ([r, g, b]: RGB) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')

/** '#rrggbb' → [r, g, b]; null if it isn't one. */
export const fromHex = (hex: string): RGB | null => {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null
}

/** Covers with less saturation than this count as colourless (white, grey, black) and glow a soft white. */
const NEUTRAL = 0.12

/**
 * A colour that glows well, keeping the dominant colour's hue: saturation pulled into a vivid range and lightness
 * into a bright-but-not-white band, so dark or muddy covers still glow and pale ones don't wash out.
 */
export const glowColor = (dominant: RGB): string => {
  const [h, s] = toHsl(dominant)
  if (s < NEUTRAL) return '#dfe8f0'
  return toHex(fromHsl([h, Math.min(1, Math.max(0.6, s)), 0.6]))
}
