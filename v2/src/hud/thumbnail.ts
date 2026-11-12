/** The side of an uploaded cover, in pixels: covers show at most about 150px, so this is sharp on a 2× screen. */
export const THUMB_SIZE = 320

/**
 * An uploaded picture as a cover: cropped to the middle square, scaled down to THUMB_SIZE (never up) and saved as a
 * JPEG data: URL, a few tens of KB, which is how it's stored (server/schema accepts these as images).
 * Rejects if the file isn't a picture the browser can read.
 */
export const thumbnailOf = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file)
  try {
    const side = Math.min(bitmap.width, bitmap.height)
    const size = Math.min(THUMB_SIZE, side)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no canvas')
    // White behind transparent pictures, as JPEG has no transparency.
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    bitmap.close()
  }
}

/** A cover link typed into the form: http(s) only. */
export const isImageLink = (text: string) => {
  try { return /^https?:$/.test(new URL(text).protocol) } catch { return false }
}
