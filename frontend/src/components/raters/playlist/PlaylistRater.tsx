import { mapSongScoreToUI } from "../../../functions/scoreUI"
import { Song } from "../../../generated/graphql"
import './PlaylistRater.css'

interface Props {
    items: Song[]
    onScoreUpdate: (updatedSong: Song) => void 
}

export const PlaylistRater = ({items, onScoreUpdate}: Props) => {

    const unratedItems = items.filter(it => !(it.score))
    const ratedItems = items.filter(it => it.score)  
    return <div id="playlist-rater">
        <ul>
        {ratedItems.map((item, index) => <li key={index} className="playlist-item">
            <div style={{background: mapSongScoreToUI(item.score || 0).color}} className="playlist-item-score">
                {item.score}
            </div>
            <div className="playlist-item-image">
                <img src={item.album.thumbnail || ''} alt='' />
            </div>
            <div className="playlist-item-name">{item.name}</div>
            <div className="playlist-item-number">{'#' +item.number + ' on '}</div>
            <div className="playlist-item-album">{item.album.name}</div>
            <div className="playlist-item-by">/</div>
            <div className="playlist-item-artist-thumbnail">
                <img src={item.artist.thumbnail || ''} alt='' />
            </div>
            <div className="playlist-item-artist">{item.artist.name}</div>
        </li>)}
        </ul>
        </div>
}