import { useEffect, useState } from "react"
import { Album, Artist } from "../../../../../generated/graphql"
import { FilterMode } from "../../../../../music/MusicFilterModels"
import { MusicNavigatorAlbumRow } from "../album/MusicNavigatorAlbumRow"
import { AnimatePresence, motion } from 'motion/react'
import { useGetAlbumsForArtist } from "../../../../../hooks/DataLoadingHooks"


interface Props {
    artist:Artist
    dispatchAlbumToRater: (album:any, mode:FilterMode) => void 
}


export const AlbumsSubpanel = ({artist}: Props) => {

    const [sortedAlbums ,setSortedAlbums] = useState<Album[]>([]) 

    const { data, loading, error } = useGetAlbumsForArtist(artist.id) 
      

     useEffect(() => {
        if (data?.albums) {
            const sorted = [...(data?.albums.content!)].sort((a,b) => a.year! - b.year! )
            setSortedAlbums(sorted as Album[])
        }

     }, [data])

    return <AnimatePresence initial={false}>

    <motion.div initial="collapsed" animate="open" exit="collapsed" variants={{ open: { height: 'auto', opacity: 1}, collapsed: { height: 0 , opacity: 0} }} transition={{ duration: 0.3, ease: 'easeInOut'}} className="nav-item-subpanel">
        <div className="nav-panel-header-item">
            <div className="nav-panel-empty">
                
            </div> 
            <div className="nav-panel-header-main">
                TITLE
            </div>
            <div className="nav-panel-header-first">
                YEAR
            </div> 
            <div className="nav-panel-header-second">
                SCORE
            </div> 
       </div> 

        {  sortedAlbums.map((album:any) => 
        <div key={`artist-album-${album.id}`}>
            <MusicNavigatorAlbumRow album={album} />
        </div>
        )}
    </motion.div>
    </AnimatePresence>
}