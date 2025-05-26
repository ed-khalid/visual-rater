import { useDraggable } from "@dnd-kit/core";
import { SongUIItem } from "../../../models/CoreModels"

interface Props {
    item: SongUIItem 
}

export const BlockRaterItem = ({item}: Props) => {

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'draggable-item-' + item.id,
        data: {
            item: item
        }
    })
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }: undefined;


    return <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="block-rater-item">
        <img src={item.thumbnail}/>
        <div className="block-rater-item-name"> 
          {item.name}
        </div>
    </div>

}