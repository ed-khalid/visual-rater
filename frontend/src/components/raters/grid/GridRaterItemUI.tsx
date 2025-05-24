import { useDraggable } from "@dnd-kit/core";
import { SongUIItem } from "../../../models/ItemTypes";


interface Props {
    item: SongUIItem
    isUnrated: boolean
}


export const GridRaterItemUI = ({item, isUnrated}: Props) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: 'draggable-fat-song-' + item.id,
        data: {
            id: item.id
        }
    })

        return <div className={"grid-rater-item" + (isUnrated? " unrated" : "")} ref={setNodeRef} {...listeners} {...attributes}>
            <img src={item.thumbnail} alt={item.name} className="grid-rater-item-thumbnail" />
            <div className="grid-rater-item-name">{item.name}</div>
        </div>
}