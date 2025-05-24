import { useDraggable } from "@dnd-kit/core"
import { Album } from "../../../../generated/graphql"
import { useMusicState } from "../../../../hooks/MusicStateHooks"

interface Props {
    album: Album
    onAlbumSelect: any
    dispatchAlbumToRater: any
}

export const MusicNavigatorAlbum = ({album, onAlbumSelect, dispatchAlbumToRater}: Props) => {

    const { attributes, listeners, setNodeRef} = useDraggable({
        id: 'draggable-album-' + album.id,
        data: {
            item: {
                type: 'album',
                id: album.id 
            }
        }
    }) 

    const musicState = useMusicState()

     const isOnRater = (album:Album) => { 
        const raterFilters = musicState.raterFilters 
        return (raterFilters.albumIds) ? raterFilters.albumIds.some(it => it === album.id) : false  
     }
        return <div ref={setNodeRef} className="nav-panel-item smaller">
            <div className="nav-item-controls" onClick={() => dispatchAlbumToRater(album, isOnRater(album))} >
                {isOnRater(album) ? '-' : '+'}
            </div> 
            <img {...attributes} {...listeners} ref={setNodeRef} className="nav-panel-item-thumbnail smaller" src={album.thumbnail!!} /> 
            <div className="nav-panel-item-info">
                <div onClick={() => onAlbumSelect(album)} className="nav-panel-item-info-name smaller">
                {album.name}
                </div>
            </div>
            <div className="nav-panel-item-year">
                {album.year}
            </div> 
            <div className="nav-panel-item-score smaller">
                {album.score?.toFixed(2) || 'N/A'}
            </div> 
        </div>

}