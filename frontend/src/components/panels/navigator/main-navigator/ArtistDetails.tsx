import { useEffect, useState } from "react"
import './ArtistDetails.css'
import { Album, Artist, useGetAlbumsQuery } from "../../../../generated/graphql"
import { AlbumDetailsPanel } from "./AlbumDetailsPanel"
import { FilterMode } from "../../../../music/MusicFilters"
import { useMusicDispatch, useMusicState, useMusicStateOperator } from "../../../../hooks/MusicStateHooks"


interface Props {
    artist:Artist
    dispatchAlbumToRater: (album:any, shouldRemove:boolean) => void 
}


export const ArtistDetails = ({artist, dispatchAlbumToRater}: Props) => {

    const musicDispatch = useMusicDispatch()
    const musicState = useMusicState() 
    const store = useMusicStateOperator()


    const [sortedAlbums ,setSortedAlbums] = useState<Album[]>([]) 
    const [albumUnderEdit, setAlbumUnderEdit] = useState<Album|undefined>(undefined) 
    const [editableAlbumName, setEditableAlbumName] = useState<string>('') 
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

     const onEdit = (album:Album) => {
        if (!albumUnderEdit) {
            setAlbumUnderEdit(album)
            setEditableAlbumName(album.name)
        } else {
            setAlbumUnderEdit(undefined)
            setEditableAlbumName('')
        }

     }

     const onSaveNewAlbumName = () => {

     }

     const isOnRater = (album:Album) => { 
        const raterFilters = musicState.raterFilters 
        return (raterFilters.albumIds) ? raterFilters.albumIds.some(it => it === album.id) : false  
     }

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
        <div  className="nav-panel-item smaller">
            <div className="nav-item-controls" onClick={() => dispatchAlbumToRater(album, isOnRater(album))} >
                {isOnRater(album) ? '-' : '+'}
            </div> 
            <img className="nav-panel-item-thumbnail smaller" src={album.thumbnail!!} /> 
            <div className="nav-panel-item-info">
                {!(albumUnderEdit === album) && <div onClick={() => onAlbumSelect(album)} className="nav-panel-item-info-name smaller">
                {album.name}
                </div>}
                {(albumUnderEdit === album) && <input className="nav-panel-item-info-name-input" value={editableAlbumName} />
                }
            </div>
            <div className="nav-panel-edit-controls">
                {!(albumUnderEdit === album) && <button onClick={() => onEdit(album) }>EDIT</button>}
                {(albumUnderEdit === album) && 
                <div className="edit-buttons">
                
                <button onClick={() => onSaveNewAlbumName() }>✓</button>
                <button onClick={() => onEdit(album) }>X</button>
                </div>
                }
             </div> 
            <div className="nav-panel-item-year">
                {album.year}
            </div> 
            <div className="nav-panel-item-score smaller">
                {album.score.toFixed(2)}
            </div> 
        </div>
            {expandedAlbumIds.some(id=> id === album.id) && <AlbumDetailsPanel key={"artist-"+artist.id+"-album-"+album.id} album={album} /> } 
        </div>
        )}
    </div>
}