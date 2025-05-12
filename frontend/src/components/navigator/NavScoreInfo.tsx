import { mapArtistScoreToUI, mapSongScoreToUI } from "../../functions/scoreUI"
import { Album, Artist, Song } from "../../generated/graphql"

interface Props {
    type: 'artist' | 'album' | 'song'    
    item: Artist | Album | Song
}


export const NavScoreInfo = ({item, type}: Props) => { 
    const score = item.score ?? 0

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
            return <div className="nav-panel-item-info-score">
                      <div className="nav-panel-item-info-score-text">
                            {score.toFixed(2)}
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