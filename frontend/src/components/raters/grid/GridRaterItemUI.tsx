import { useDraggable } from "@dnd-kit/core";
import { SongUIItem } from "../../../models/ItemTypes";


interface Props {
    item: SongUIItem
}


export const GridRaterItemUI = ({item}: Props) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'draggable-item-' + item.id,
        data: {
            item: item
        }
    })
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }: undefined;

        return <div className="grid-rater-item" ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <img src={item.thumbnail} alt={item.name} className="grid-rater-item-thumbnail" />
            <div className="grid-rater-item-name">{item.name}</div>
        </div>
}