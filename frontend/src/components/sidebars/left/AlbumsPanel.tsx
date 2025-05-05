import { mapArtistScoreToUI } from "../../../functions/scoreUI"
import { Album } from "../../../generated/graphql"
import { Panel } from "../../panels/Panel"

interface Props {
    albums: Album[]
    artistName: string
    onClick: any
    onClose: any
}

export const AlbumsPanel = ({artistName, albums, onClick, onClose}: Props) => {

    return <Panel className="musical-panel" title={artistName + " Albums"} isCloseable={true} onClose={onClose} >
        <ul id="albums-list">
                {albums.map(album => <li onClick={() => onClick(album) } className="flex" key={'albums-panel-item-' + album.id}>
                  <img src={album.thumbnail!!} alt='?' className="musical-panel-item-thumbnail"/> 
                  <div className="musical-panel-item-info">
                    <div className="musical-panel-item-info-name">{album.name} </div>
                    <div className="musical-panel-item-info-year">{album.year} </div>
                  </div>
                  <div className="musical-panel-item-info-rating">
                    <div className="musical-panel-item-info-score">
                    { 
                      mapArtistScoreToUI(album.score!!).category  
                    }
                    </div>
                    <div className="musical-panel-item-info-score-descriptor">{mapArtistScoreToUI(album.score!!).score}</div>
                  </div> 
                </li> )}

        </ul>
    </Panel>

} 