import { Dispatch, useEffect, useState } from "react"
import './ArtistDetails.css'
import { Album, Artist, useGetAlbumsQuery } from "../../generated/graphql"
import { MusicAction } from "../../music/MusicAction"
import { AlbumDetailsPanel } from "./AlbumDetailsPanel"
import { MusicState } from "../../music/MusicState"
import { MusicStore } from "../../music/MusicStore"


interface Props {
    artist:Artist
    musicDispatch: Dispatch<MusicAction>
    musicState: MusicState 
    dispatchAlbumToRater: (album:any, shouldRemove:boolean) => void 
}


export const ArtistDetails = ({musicDispatch, musicState, artist, dispatchAlbumToRater}: Props) => {

    const [sortedAlbums ,setSortedAlbums] = useState<Album[]>([]) 
    const [albumUnderEdit, setAlbumUnderEdit] = useState<Album|undefined>(undefined) 
    const [editableAlbumName, setEditableAlbumName] = useState<string>('') 
    const [expandedAlbums, setExpandedAlbums] =useState<Album[]>([])

    

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
        const newAlbums = expandedAlbums.some(a => a.id === album.id) ? 
            expandedAlbums.filter(it => it.id !== album.id)  :
            [...expandedAlbums, album]
            setExpandedAlbums(newAlbums)
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
            {expandedAlbums.some(a=> a.id === album.id) && <AlbumDetailsPanel key={"artist-"+artist.id+"-album-"+album.id} musicDispatch={musicDispatch} album={album} /> } 
        </div>
        )}
    </div>
}