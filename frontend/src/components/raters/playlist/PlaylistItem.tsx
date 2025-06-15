import { useSortable } from "@dnd-kit/sortable"
import { Song } from "../../../generated/graphql"
import { CSS } from "@dnd-kit/utilities"
import { mapSongScoreToUI } from "../../../functions/scoreUI"

interface Props {
    item: Song
    onScoreUpdate: (updatedSong: Song) => void
}

export const PlaylistItem = ({item, onScoreUpdate}: Props) => {

    const { attributes, listeners, setNodeRef,transform,transition, isDragging } = useSortable({ id: item.id, data: item })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    }
    const updateScoreByOne = (isPositive: boolean) => {
        if (isPositive && item.score === 99) return // max score
        if (!isPositive && item.score === 0) return // max score
        const newScore = isPositive ? (Math.floor(item.score || 0)) + 1 : (Math.floor(item.score || 0)) - 1
        onScoreUpdate({...item, score: newScore})
    }

    return <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="playlist-item">
            <div style={{background: mapSongScoreToUI(item.score || 0).color}} className="playlist-item-score">
                <button onClick={() => updateScoreByOne(true)}>+</button>
                {Math.floor(item.score || 0)}
                <button onClick={() => updateScoreByOne(false)}>-</button>
            </div>
            <div className="playlist-item-image">
                <img src={item.album.thumbnail || ''} alt='' />
            </div>
            <div className="playlist-item-details">
                <div className="playlist-item-name">{item.name}</div>
                <div className="playlist-item-album">{item.album.name}</div>
            </div>
            <div className="playlist-item-artist-thumbnail">
                <img src={item.artist.thumbnail || ''} alt='' />
            </div>
            <div className="playlist-item-artist">{item.artist.name}</div>
        </li>

}