import { useEffect } from 'react'
import { isSplit, useView } from '../scene/view'
import { loadArtists } from '../state/remote'
import { useStore } from '../state/store'

/**
 * MUSIC: loads artists' albums and tracks (state/remote.ts loadArtists) when the view needs them: the artist picked on
 * the rater (and their overview), or every artist with an album on the tree once the rater shows albums or songs for
 * all of them, in split view, in the list view of songs, and in compare (its picker offers every album). The catalog, the ADD palette and the drag card ask for their own.
 */
export const LibraryLoader = () => {
  const music = useStore(s => s.activeType === 'music')
  const drill = useView(v => v.drill)
  const all = useView(v => isSplit(v) || v.comparing || (v.phase !== 'tree' && v.zoom === 'songs') || (!v.drill && !v.albumView && v.zoom !== 'artists'))
  const pending = useStore(s => Object.keys(s.artistInfo).length > 0)
  useEffect(() => {
    if (!music || !pending) return
    if (all) {
      const info = useStore.getState().artistInfo
      void loadArtists(Object.keys(info).filter(id => info[id].firstAdded !== undefined))
    } else if (drill) void loadArtists([drill])
  }, [music, drill, all, pending])
  return null
}
