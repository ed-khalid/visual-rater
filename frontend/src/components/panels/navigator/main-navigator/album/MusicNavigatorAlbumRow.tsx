import { Album } from "../../../../../generated/graphql"
import { useMusicState } from "../../../../../hooks/MusicStateHooks"
import { NavScoreInfo } from "../../NavScoreInfo"
import { VisualRaterButton } from "../../../../common/VisRaterButton"
import { useContext } from "react"
import { MusicNavigatorContext } from "../../../../../providers/MusicNavigationProvider"

interface Props {
    album: Album
    isExpanded:boolean
    onAlbumExpand: any
    dispatchAlbumToRater: any
}

export const MusicNavigatorAlbumRow = ({album, isExpanded, onAlbumExpand, dispatchAlbumToRater}: Props) => {

    const { openOverview } = useContext(MusicNavigatorContext)

    return <div className="nav-panel-item album smaller">
        <div className="nav-item-controls smaller">
            <VisualRaterButton onClick={() => dispatchAlbumToRater(album,true)}>
                {'+'}  
                </VisualRaterButton> 
            <VisualRaterButton animate={{rotate: isExpanded ? 90 : 0}} onClick={() => onAlbumExpand(album)}>{'>'}</VisualRaterButton>   
        </div> 
        <img className="nav-panel-item-thumbnail smaller" src={album.thumbnail!!} /> 
        <div className="nav-panel-item-info">
            <div onClick={() => openOverview({ id: album.id, type: 'album' }) } className="nav-panel-item-info-name smaller">
            {album.name}
            </div>
            <div className="nav-panel-item-year">
                {album.year}
            </div> 
            <NavScoreInfo item={album} type={'album'}/>
        </div>

}