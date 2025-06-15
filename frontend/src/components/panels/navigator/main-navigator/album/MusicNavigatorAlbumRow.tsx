import { Album } from "../../../../../generated/graphql"
import { NavScoreInfo } from "../../NavScoreInfo"
import { VisualRaterButton } from "../../../../common/VisRaterButton"
import { useContext } from "react"
import { MusicNavigatorContext } from "../../../../../providers/MusicNavigationProvider"
import { useMusicState } from "../../../../../hooks/MusicStateHooks"
import { FilterMode } from "../../../../../music/MusicFilterModels"

interface Props {
    album: Album
    isExpanded:boolean
    onAlbumExpand: any
}

export const MusicNavigatorAlbumRow = ({album, isExpanded, onAlbumExpand }: Props) => {

    const musicState = useMusicState()

    const { openOverview, dispatchToRater } = useContext(MusicNavigatorContext)

    const openAlbumOverview = (album:Album) => {

    }

    const isOnRater = (album:Album) => musicState.playlistFilters.albumIds?.some(it => it === album.id) || false
    

    return <div className="nav-panel-item album smaller">
        <div className="nav-item-controls smaller">
            <VisualRaterButton onClick={() => dispatchToRater( { artistId: album.artist.id, albumId: album.id }, isOnRater(album)? FilterMode.REDUCTIVE : FilterMode.ADDITIVE )}>
                {isOnRater(album) ? '-' : '+'}  
                </VisualRaterButton> 
            <VisualRaterButton onClick={() => openAlbumOverview(album)}>
                O
            </VisualRaterButton>  
            <VisualRaterButton animate={{rotate: isExpanded ? 90 : 0}} onClick={() => onAlbumExpand(album)}>{'>'}</VisualRaterButton>   
        </div> 
        <img className="nav-panel-item-thumbnail smaller" src={album.thumbnail!!} /> 
        <div className="nav-panel-item-info">
            <div className="nav-panel-item-info-name smaller">
            {album.name}
            </div>
        </div>
        <div className="nav-panel-item-year">
            {album.year}
        </div> 
        <NavScoreInfo item={album} type={'album'}/>
    </div>

}