import { useDroppable } from "@dnd-kit/core"
import { FatSong } from "../../../models/RaterTypes"
import { SimpleRaterItem } from "./SimpleRaterItem"
import { Maybe } from "graphql/jsutils/Maybe"

interface Props {
    score: Maybe<number>
    items: FatSong[]
}


export const SimpleRaterCategoryDetailRow = ({score,items}:Props) =>  {

    const droppableProps  = useDroppable({
        id: 'simple-rater-category-detail-row-score-' + score,
        data: {
            score
        }
    }) 

    return <div ref={droppableProps.setNodeRef} className="score-detail-box">
        <div className="score-number">{score || 'N/A'}</div>
        <div className="score-detail-box-items">
            {items.map(it => <SimpleRaterItem item={it} />)}
        </div>
    </div> 

}