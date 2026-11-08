import { useEffect } from 'react'
import { find } from '../state/board'
import { useStore } from '../state/store'
import { dominantColor, fromHex, glowColor, toHex } from './color'

/** Sample size: covers are shrunk to this many pixels a side before picking a colour. */
const SAMPLE = 32
/** Dominant colour per cover URL, so an album's tracks (same cover) only work it out once. */
const byUrl = new Map<string, Promise<string | null>>()

/** Loads a cover so its pixels can be read (Spotify's image server allows that across origins). */
const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => resolve(img)
  img.onerror = reject
  img.src = url
})

/** A cover image's dominant colour as '#rrggbb', or null if it can't be read. */
export const dominantColorOfCover = (url: string): Promise<string | null> => {
  if (!byUrl.has(url)) {
    byUrl.set(url, loadImage(url).then(image => {
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
export const useGlow = (item: { id: string, image?: string, colors?: string[] } | undefined): string | undefined => {
  const saved = item?.colors?.[0]
  const id = item?.id, image = item?.image
  useEffect(() => {
    if (saved || !id || !image) return
    let cancelled = false
    void dominantColorOfCover(image).then(color => {
      if (!cancelled && color && find(useStore.getState(), id)?.entity.image === image) useStore.getState().setColors(id, [color])
    })
    return () => { cancelled = true }
  }, [saved, id, image])
  const rgb = saved ? fromHex(saved) : null
  return rgb ? glowColor(rgb) : undefined
}
