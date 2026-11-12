import { useRef, useState } from 'react'
import { useStore } from '../state/store'
import { thumbnailOf } from './thumbnail'

/**
 * An album's cover or an artist's photo in their overview, as a button: a click picks a picture from the device,
 * which is cropped and shrunk (thumbnail.ts) and saved as their image (store.setImage). `className` sizes it (the
 * overview's cover classes); a picture the browser can't read leaves the image as it was.
 */
export const CoverUpload = ({ id, name, image, className }: { id: string, name: string, image?: string, className: string }) => {
  const file = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const setImage = useStore(s => s.setImage)
  const onPick = async (f: File | undefined) => {
    if (!f) return
    setBusy(true)
    try { setImage(id, await thumbnailOf(f)) } catch { /* not a picture: nothing changes */ } finally {
      setBusy(false)
      if (file.current) file.current.value = ''
    }
  }
  return <button type="button" className={`${className} cover-upload${busy ? ' busy' : ''}`} onClick={() => file.current?.click()}
    aria-label={`Upload a picture for ${name}`}>
    {image && <img src={image} alt="" draggable={false} />}
    <input ref={file} type="file" accept="image/*" hidden onChange={e => void onPick(e.target.files?.[0])} />
  </button>
}
