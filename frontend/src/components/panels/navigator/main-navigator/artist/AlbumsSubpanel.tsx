import { useEffect, useState } from "react"
import { Album, Artist, useGetAlbumsQuery } from "../../../../../generated/graphql"
import { SongsSubpanel } from "../album/SongsSubpanel"
import { FilterMode } from "../../../../../music/MusicFilterModels"
import { useMusicDispatch, useMusicStateOperator } from "../../../../../hooks/MusicStateHooks"
import { MusicNavigatorAlbumRow } from "../album/MusicNavigatorAlbumRow"
import { AnimatePresence, motion } from 'motion/react'


interface Props {
    artist:Artist
    dispatchAlbumToRater: (album:any, mode:FilterMode) => void 
}


export const AlbumsSubpanel = ({artist, dispatchAlbumToRater}: Props) => {

    const musicDispatch = useMusicDispatch()
    const store = useMusicStateOperator()


    const [sortedAlbums ,setSortedAlbums] = useState<Album[]>([]) 
    const expandedAlbumIds:string[]  = store.navigationFilters.find(it => it.artistId === artist.id)?.albumIds || []

    const { data, loading, error } = useGetAlbumsQuery({ variables: {
        ids: artist.albums.map((it:any) => it.id)
     }}) 

     useEffect(() => {
        if (data?.albums) {
            musicDispatch({ type: 'DATA_CHANGE', data: { albums: data.albums as Album[] }})
            const sorted = [...(data?.albums!)].sort((a,b) => a.year! - b.year! )
            setSortedAlbums(sorted as Album[])
        }

     }, [data])

    const onAlbumExpand = (album:Album) => {
        expandedAlbumIds.some(id => id === album.id) ? 
            musicDispatch({type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId: artist.id, albumId: album.id, mode: FilterMode.REDUCTIVE}) :
            musicDispatch({type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId: artist.id, albumId: album.id, mode: FilterMode.ADDITIVE })
    }


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
            <MusicNavigatorAlbumRow isExpanded={expandedAlbumIds.includes(album.id)} album={album} onAlbumExpand={onAlbumExpand} dispatchAlbumToRater={dispatchAlbumToRater} />
            {expandedAlbumIds.some(id=> id === album.id) && <SongsSubpanel key={"artist-"+artist.id+"-album-"+album.id} album={album} /> } 
        </div>
        )}
    </motion.div>
    </AnimatePresence>
}