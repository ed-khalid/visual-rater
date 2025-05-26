import { useDroppable } from "@dnd-kit/core"
import { FatSong } from "../../../models/RaterModels"

interface Props {
    items: FatSong[]
    score: number
}

export const SimpleRaterCategoryScore = ({items, score}:Props) => {

    const { isOver, setNodeRef } = useDroppable({
        id : 'category-row-score-box' + score ,
        data: {
            score 
        }
    }) 

                return <div ref={setNodeRef} className="score-number-box">
                    <div className="score-number">{score}</div>
                    {items.map(item => 
                        (<div className="score-number-item">
                            <div className="score-number-item-thumbnail">
                                <img src={item.album.thumbnail || ''} alt="cover" />
                            </div>
                            <div className="score-number-item-name">
                                {item.song.name}
                            </div>
                        </div>)
                    )}
                    </div>
}