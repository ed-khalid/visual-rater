import { useDraggable } from "@dnd-kit/core"
import { CSSProperties } from "react"
import { Song } from "../../../generated/graphql"

interface Props {
    item: Song
}



export const SimpleRaterItem = ({item}: Props) => {

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'draggable-unrated-song-' + item.id,
        data: {
            item: item
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
                    {item.name}
                </div>
            </div>
} 