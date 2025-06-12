import { useDroppable } from "@dnd-kit/core"
import { SimpleRaterItem } from "./SimpleRaterItem"
import { Maybe } from "graphql/jsutils/Maybe"
import { Song } from "../../../generated/graphql"

interface Props {
    score: Maybe<number>
    items: Song[]
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