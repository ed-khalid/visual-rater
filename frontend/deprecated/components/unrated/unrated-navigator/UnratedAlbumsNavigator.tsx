import { UnratedAlbum } from "../../../pages/UnratedPage"
import { Panel } from "../../common/Panel"
import '../../common/Panel.css'

interface Props {
    albums: UnratedAlbum[] 
    onSelect : (unratedAlbum:UnratedAlbum) => void
}

export const UnratedAlbumsNavigator = ({albums, onSelect}:Props ) => {

    return <Panel className="nav-panel" title="Unrated Albums"> 
      <ul id="unrated-albums-list">
        {albums.map(album => 
        <li key={"unrated-album-" + album.id} className="unrated-album-row">  
                <div className="nav-panel-item">
                <div className="nav-panel-item-thumbnail">
                    <img src={album.thumbnail || ''} alt="" />
                </div>
                <div className="nav-panel-item-info">
                    <div className="nav-panel-item-info-name">
                            {album.name}
                    </div>
                    <div className="nav-panel-item-info-name smaller">
                        {album.artist.name}
                    </div>  
                    <div className="nav-panel-item-info-name smaller">
                        {album.year}
                    </div>  
                </div>
                <div className="nav-panel-action">
                    <button onClick={() => onSelect(album)}>
                        RATE
                    </button>
                </div>
                </div>
        </li>
        )}
      </ul>
    </Panel>
} 