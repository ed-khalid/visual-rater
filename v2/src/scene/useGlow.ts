import { useEffect } from 'react'
import type { Item } from '../shared/model'
import { useStore } from '../state/store'
import { dominantColor, fromHex, glowColor, toHex } from './color'
import { loadCover } from './CoverSphere'

/** Sample size: covers are shrunk to this many pixels a side before picking a colour. */
const SAMPLE = 32
/** Dominant colour per cover URL, so an album's tracks (same cover) only work it out once. */
const byUrl = new Map<string, Promise<string | null>>()

/** A cover image's dominant colour as '#rrggbb', or null if it can't be read. */
export const dominantColorOfCover = (url: string): Promise<string | null> => {
  if (!byUrl.has(url)) {
    byUrl.set(url, loadCover(url).then(texture => {
      const image = texture.image as CanvasImageSource
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = SAMPLE
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return null
      ctx.drawImage(image, 0, 0, SAMPLE, SAMPLE)
      return toHex(dominantColor(ctx.getImageData(0, 0, SAMPLE, SAMPLE).data))
    }).catch(() => null))
  }
  return byUrl.get(url)!
}

/**
 * An item's glow colour. The item stores the raw dominant colour of its cover (the first of its `colors`): a plain
 * fact about the image, saved to the database and worked out only once. The glow is derived from it here, every
 * time, so changing how glows look never touches saved data.
 */
export const useGlow = (item: Pick<Item, 'id' | 'image' | 'colors'> | undefined): string | undefined => {
  const saved = item?.colors?.[0]
  const id = item?.id, image = item?.image
  useEffect(() => {
    if (saved || !id || !image) return
    let cancelled = false
    void dominantColorOfCover(image).then(color => {
      if (!cancelled && color && useStore.getState().items[id]?.image === image) useStore.getState().setItemDetails(id, { colors: [color] })
    })
    return () => { cancelled = true }
  }, [saved, id, image])
  const rgb = saved ? fromHex(saved) : null
  return rgb ? glowColor(rgb) : undefined
}
