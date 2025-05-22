import { Maybe } from "graphql/jsutils/Maybe"
import { mapArtistScoreToUI, mapSongScoreToUI } from "../../../functions/scoreUI"

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
            return <div style={{backgroundColor: mapArtistScoreToUI(score).color}} className="nav-panel-item-info-score">
                      <div className="nav-panel-item-info-score-text">
                            {(score) ? score.toFixed(2) : 'N/A'}
                      </div>
                   </div> 
        case "song":
                return <div className="nav-panel-item-info-score" style={{background: mapSongScoreToUI(score).color }}>
                    <div className="nav-panel-item-info-score-text">
                        {score}
                    </div>
                </div>
    }
}