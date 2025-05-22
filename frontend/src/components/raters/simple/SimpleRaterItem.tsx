import { useDraggable } from "@dnd-kit/core"
import { FatSong } from "../../../models/RaterTypes"
import { CSSProperties } from "react"

interface Props {
    item: FatSong
}



export const SimpleRaterItem = ({item}: Props) => {

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'draggable-unrated-song-' + item.song.id,
        data: {
            item: item.song
        }
    })
    const style: CSSProperties|undefined = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 3
    }: undefined;


            return <div style={style} ref={setNodeRef} {...attributes} {...listeners} 
            
            className="score-detail-box-item"
            > 
                <div className="score-detail-box-item-thumbnail">
                <img src={item.album.thumbnail || ''}  />
            </div>
                <div className="score-detail-box-item-name">
                    {item.song.name}
                </div>
            </div>
} 