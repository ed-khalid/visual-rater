import { useDraggable } from "@dnd-kit/core"
import { Album } from "../../../../generated/graphql"
import { useMusicState } from "../../../../hooks/MusicStateHooks"
import { NavScoreInfo } from "../NavScoreInfo"
import { VisualRaterButton } from "../../../common/VisRaterButton"

interface Props {
    album: Album
    isExpanded:boolean
    onAlbumSelect: any
    dispatchAlbumToRater: any
}

export const MusicNavigatorAlbum = ({album, isExpanded, onAlbumSelect, dispatchAlbumToRater}: Props) => {

    const { attributes, listeners, setNodeRef} = useDraggable({
        id: 'draggable-album-' + album.id,
        data: {
            item: {
                type: 'album',
                id: album.id 
            }
        }
    }) 

    const openAlbumOverview = (album:Album) => {

    }

    const musicState = useMusicState()

     const isOnRater = (album:Album) => { 
        const raterFilters = musicState.raterFilters 
        return (raterFilters.albumIds) ? raterFilters.albumIds.some(it => it === album.id) : false  
     }
        return <div ref={setNodeRef} className="nav-panel-item smaller">
            <div className="nav-item-controls">
                <VisualRaterButton onClick={() => dispatchAlbumToRater(album, isOnRater(album))}>
                    {isOnRater(album) ? '-' : '+'}  
                    </VisualRaterButton> 
                <VisualRaterButton onClick={() => openAlbumOverview(album)}>
                    O
                </VisualRaterButton>  
                <VisualRaterButton animate={{rotate: isExpanded ? 90 : 0}} onClick={() => onAlbumSelect(album)}>{'>'}</VisualRaterButton>   
            </div> 
            <img {...attributes} {...listeners} ref={setNodeRef} className="nav-panel-item-thumbnail smaller" src={album.thumbnail!!} /> 
            <div className="nav-panel-item-info">
                <div className="nav-panel-item-info-name smaller">
                {album.name}
                </div>
            </div>
            <div className="nav-panel-item-year">
                {album.year}
            </div> 
            <div className="nav-panel-item-score smaller">
                <NavScoreInfo item={album} type={'album'}/>
            </div> 
        </div>

}