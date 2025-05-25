import { useEffect, useState } from "react"
import './ArtistDetails.css'
import { Album, Artist, useGetAlbumsQuery } from "../../../../generated/graphql"
import { AlbumDetailsPanel } from "./AlbumDetailsPanel"
import { FilterMode } from "../../../../music/MusicFilters"
import { useMusicDispatch, useMusicState, useMusicStateOperator } from "../../../../hooks/MusicStateHooks"
import { MusicNavigatorAlbum } from "./MusicNavigatorAlbum"


interface Props {
    artist:Artist
    dispatchAlbumToRater: (album:any, shouldRemove:boolean) => void 
}


export const ArtistDetails = ({artist, dispatchAlbumToRater}: Props) => {

    const musicDispatch = useMusicDispatch()
    const store = useMusicStateOperator()


    const [sortedAlbums ,setSortedAlbums] = useState<Album[]>([]) 
    const expandedAlbumIds  = store.navigationFilters.find(it => it.artistId === artist.id)?.albumIds || []

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

    const onAlbumSelect = (album:Album) => {
        expandedAlbumIds.some(id => id === album.id) ? 
            musicDispatch({type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId: artist.id, albumId: album.id, mode: FilterMode.REDUCTIVE}) :
            musicDispatch({type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId: artist.id, albumId: album.id, mode: FilterMode.ADDITIVE })
    }


    return <div className="nav-item-subpanel">
        <div className="nav-panel-header-item">
            <div style={{width: '140px'}} className="nav-panel-empty">
                
            </div> 
            <div style={{width: '310px'}}>
                TITLE
            </div>
            <div style={{width: '60px'}}>
                YEAR
            </div> 
            <div style={{width: '60px', background:'inherit'}} >
                SCORE
            </div> 
       </div> 

        {  sortedAlbums.map((album:any) => 
        <div key={`artist-album-${album.id}`}>
            <MusicNavigatorAlbum isExpanded={expandedAlbumIds.includes(album.id)} album={album} onAlbumSelect={onAlbumSelect} dispatchAlbumToRater={dispatchAlbumToRater} />
            {expandedAlbumIds.some(id=> id === album.id) && <AlbumDetailsPanel key={"artist-"+artist.id+"-album-"+album.id} album={album} /> } 
        </div>
        )}
    </div>
}