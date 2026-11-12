import { useEffect } from 'react'
import { ratingFocus as focusRef, useView } from '../scene/view'
import { ratingFocus } from '../state/board'
import { useStore } from '../state/store'

/**
 * Active rating: keeps the scene's fade (view.ratingFocus) in step with the store, and ends it once every fruit
 * being rated has a score, on Esc (when no popup or palette is open), or when the tree closes.
 */
export const RatingWatch = () => {
  const batch = useView(v => v.rating)
  const activeType = useStore(s => s.activeType)
  const tracks = useStore(s => s.tracks), movies = useStore(s => s.movies), books = useStore(s => s.books)

  useEffect(() => {
    const focus = batch && activeType ? ratingFocus({ tracks, movies, books, albums: {}, artists: {} }, activeType, batch) : null
    focusRef.ids = focus
    if (batch && !focus) useView.getState().endRating()
  }, [batch, activeType, tracks, movies, books])

  useEffect(() => () => { focusRef.ids = null; useView.getState().endRating() }, [activeType])

  useEffect(() => {
    if (!batch) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || useView.getState().editing || document.querySelector('.palette')) return
      // Esc in a text field (a score in the list, a song typed onto Misc) is that field's own.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      useView.getState().endRating()
    }
    // Capture phase: decide before the popup or palette closes itself on the same Esc.
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [batch])

  return null
}
