import { useDroppable } from "@dnd-kit/core"
import { FatSong } from "../../../models/RaterModels"

interface Props {
    category:string
    color: string
    scores:number[]  
    items:FatSong[]
}

export const SimpleRaterCategory = ({category, color, scores, items}: Props) => {
    const middleScore = scores[scores.length/2]

    const { isOver, setNodeRef } = useDroppable({
        id : 'category-row' + middleScore ,
        data: {
            score: middleScore
        }

    }) 

        return <div className="category-wrapper">
        <div ref={setNodeRef} className="category"> 
            <div  className="color" style={{backgroundColor: color}}>&nbsp;</div>
            { category} </div> 
            {items.length && <div className="scored-items">
                {scores.map( it => <div className="score-number-box">
                    <div className="score-number">{it}</div>
                    {items.filter(it2 => it2.song.score === it).map(it3 => 
                        (<div className="score-number-item">
                            <div className="score-number-item-thumbnail">
                                <img src={it3.album.thumbnail || ''} alt="cover" />
                            </div>
                            <div className="score-number-item-name">
                                {it3.song.name}
                            </div>
                        </div>)
                    )}
                    
                </div>)}
            </div> }
        </div> 
}