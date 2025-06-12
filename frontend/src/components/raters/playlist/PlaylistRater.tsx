import { FatSong } from "../../../models/CoreModels"

interface Props {
    items: FatSong[]
}

export const PlaylistRater = ({items}: Props) => { 

    return <div id="playlist-rater">
        <ul>
        {items.map((item, index) => <li key={index} className="playlist-item">
            <div className="playlist-item-score">
                {item.song.score}
            </div>
            <div className="playlist-item-image">
                <img src={item.album.thumbnail || ''} alt='' />
            </div>
            <div className="playlist-item-info">
                <div className="playlist-item-name">{item.song.name}</div>
                <div className="playlist-item-artist">{item.artist.name}</div>
                <div className="playlist-item-album">{item.album.name}</div>
            </div>
        </li>)}
        </ul>
        </div>
}