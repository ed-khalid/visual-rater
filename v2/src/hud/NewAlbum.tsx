import { useEffect, useRef, useState } from 'react'
import { useView } from '../scene/view'
import { useStore } from '../state/store'
import { isImageLink, thumbnailOf } from './thumbnail'
import './albumOverlays.css'
import './newAlbum.css'

/**
 * ADD ALBUM on an artist's overview (ArtistView): an album made by hand, with its title, year, cover (a link or an
 * uploaded picture, shrunk by thumbnail.ts) and songs, one per line. It goes on the rater at once, every song unrated
 * (store.createAlbum), and album view opens on it; more songs can be added there (ADD SONG). Esc closes the form.
 */
export const NewAlbum = ({ artistId, onClose }: { artistId: string, onClose: () => void }) => {
  const createAlbum = useStore(s => s.createAlbum)
  const file = useRef<HTMLInputElement>(null)
  const title = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [year, setYear] = useState('')
  const [link, setLink] = useState('')
  const [upload, setUpload] = useState<string | null>(null)
  const [songs, setSongs] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { title.current?.focus() }, [])
  useEffect(() => { setError(null) }, [name, year, link, upload, songs])

  const yearOk = year.trim() === '' || /^\d{4}$/.test(year.trim())
  const linkOk = link.trim() === '' || isImageLink(link.trim())
  const ready = name.trim() !== '' && yearOk && linkOk
  const lines = songs.split('\n').filter(l => l.trim())

  const onUpload = async (f: File | undefined) => {
    if (!f) return
    try { setUpload(await thumbnailOf(f)); setLink('') } catch { setError('That file isn’t a picture.') }
    if (file.current) file.current.value = ''
  }

  const submit = () => {
    if (!ready) return
    const image = upload ?? (link.trim() || undefined)
    const id = createAlbum(artistId, { name, ...(year.trim() ? { year: Number(year.trim()) } : {}), ...(image ? { image } : {}), tracks: lines })
    if (!id) return setError(`They already have an album called “${name.trim()}”.`)
    onClose()
    useView.getState().setAlbumView(id)
  }

  return <form className="new-album" aria-label="New album" noValidate
    onSubmit={e => { e.preventDefault(); submit() }}
    onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose() } }}>
    <div className="new-album-head">
      {upload ?? (link.trim() && linkOk ? link.trim() : undefined)
        ? <img className="new-album-cover" src={upload ?? link.trim()} alt="" />
        : <span className="new-album-cover" />}
      <input ref={title} className="new-album-title" value={name} onChange={e => setName(e.target.value)} placeholder="Title" aria-label="Title" />
    </div>
    <label className="new-album-field">
      <span className="new-album-label">Year</span>
      <input value={year} onChange={e => setYear(e.target.value)} inputMode="numeric" maxLength={4} placeholder="—" aria-invalid={!yearOk} />
    </label>
    <div className="new-album-field">
      <span className="new-album-label">Cover</span>
      {upload
        ? <><span className="new-album-uploaded">Uploaded picture</span>
          <button type="button" className="new-album-small" onClick={() => setUpload(null)}>REMOVE</button></>
        : <><input value={link} onChange={e => setLink(e.target.value)} placeholder="Link" inputMode="url" autoComplete="off"
            aria-invalid={!linkOk} aria-label="Cover link" />
          <button type="button" className="new-album-small" onClick={() => file.current?.click()}>UPLOAD</button></>}
      <input ref={file} type="file" accept="image/*" hidden onChange={e => void onUpload(e.target.files?.[0])} />
    </div>
    <label className="new-album-field new-album-songs">
      <span className="new-album-label">Songs</span>
      <textarea value={songs} onChange={e => setSongs(e.target.value)} rows={8} placeholder="One per line" aria-label="Songs, one per line" />
    </label>
    {error && <div className="new-album-error" role="alert">{error}</div>}
    <div className="new-album-actions">
      <button type="button" className="album-action" onClick={onClose}>CANCEL</button>
      <button type="submit" className="album-action album-action-primary" disabled={!ready}>ADD ALBUM</button>
    </div>
  </form>
}
