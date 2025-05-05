import { mapSongScoreToUI } from "../../../functions/scoreUI"
import { Album, Song } from "../../../generated/graphql"
import { Panel } from "../../panels/Panel"

interface Props {
    songs: Song[] 
    album: Album
    onClose: any
}

export const SongsPanel = ({songs, album, onClose}: Props ) => {

    return <Panel className="musical-panel" title={album.name + ' Tracks'} isCloseable={true} onClose={onClose}>

        <ul id="songs-list">
                {songs.map(song => <li className="flex" key={'songs-panel-item-' + song.id}>
                  <img src={album.thumbnail!!} alt='?' className="musical-panel-item-thumbnail"/> 
                  <div className="musical-panel-item-info">
                    <div className="musical-panel-item-info-name">{song.name} </div>
                  </div>
                  <div style={{background: mapSongScoreToUI(song.score).color}} className="musical-panel-item-info-rating">
                    <div className="musical-panel-item-info-score">
                    { 
                      mapSongScoreToUI(song.score).score  
                    }
                    </div>
                    <div className="musical-panel-item-info-score-descriptor">{mapSongScoreToUI(song.score).category}</div>
                  </div> 
                </li> )}
        </ul>

    </Panel>


}