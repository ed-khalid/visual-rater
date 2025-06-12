import { Maybe } from "graphql/jsutils/Maybe"
import { map100ScoreTo10Score, mapAlbumScoreToUI, mapArtistScoreToUI, mapSongScoreToUI } from "../../../functions/scoreUI"

interface Props {
    type: 'artist' | 'album' | 'song'    
    item: { score?: Maybe<number>} 
}


export const NavScoreInfo = ({item, type}: Props) => { 
    const score = item.score 

    switch(type) {
        case "artist": 
                    return <div style={{background: mapArtistScoreToUI(score).color}} className="nav-panel-item-score">
                      <div className="nav-panel-item-info-score-text">
                      { 
                        mapArtistScoreToUI(score).category  
                      }
                      </div>
                      <div className="nav-panel-item-info-score-descriptor">{mapArtistScoreToUI(score).score}</div>
                    </div> 
        case "album":
            return <div style={{backgroundColor: mapAlbumScoreToUI(score).color}} className="nav-panel-item-score album">
                            {(score) ? (map100ScoreTo10Score(score)).toFixed(2) : 'N/A'}
                   </div> 
        case "song":
                return <div className="nav-panel-item-score song" style={{background: mapSongScoreToUI(score).color }}>
                    <div className="nav-panel-item-info-score-text">
                        {(score) ? map100ScoreTo10Score(score) : ''}
                    </div>
                </div>
    }
}