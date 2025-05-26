import { useDroppable } from "@dnd-kit/core"
import { SongScoreUIBase } from "../../../models/ScoreModels"
import { useEffect, useState } from "react"
import { SimpleRaterCategoryDetailRow } from "./SimpleRaterCategoryDetailRow"
import { FatSong } from "../../../models/RaterModels"

interface Props {
    category: SongScoreUIBase
    items: FatSong[] 
}

export const SimpleRaterCategoryRow = ({category, items}: Props) => {

    useEffect(() => {
        if (items.length) {
            setIsExpanded(true)
        }
    }, [items])

    const [isExpanded, setIsExpanded] = useState<boolean>(false)

    const middleScore = category.threshold.low + Math.floor((category.threshold.high - category.threshold.low)/2)    

    const categoryExpandedValues = () => {
        if (category.category === 'UNRATED' ) {
            return [null]
        }
        const lo = category.threshold.low  
        const hi = category.threshold.high 
        const length = hi - lo + 1 
        return Array.from({length}, ( _, i ) => lo + i)   
    }  

    const onExpanderClick =  () => {
        setIsExpanded(prev => !prev)
    }

    const {isOver, setNodeRef} = useDroppable({
        id: 'simple-rater-row-' + middleScore,
        data: {
            score: middleScore 
        }
    }) 

    const style = { color: isOver? 'green': undefined } 

    const getCategoryItemCount = (): string => {
        const itemsSize = items.length || 0 
        if (itemsSize) {
            return itemsSize + ' songs'
        } else return ''
    }
    const getCategoryDescription = (): string => {
        if (category.category === 'UNRATED') return 'N/A' 
        return `(${category.threshold.low} - ${category.threshold.high})`
    }

        return <div onClick={() => onExpanderClick()} className="category"> 
            <div className="color" style={{backgroundColor: category.color}}>&nbsp;</div>
        <div className="category-content">
            <div ref={setNodeRef} style={style} className="category-main-row">
                <div className="category-items-count">
                    {getCategoryItemCount()}
                </div>
                <div className="category-name">
                    {category.category}
                </div>
                <div className="category-description">
                    {getCategoryDescription()}
                </div>
            </div>
            {isExpanded && 
            <div className="category-expanded-row">
            {categoryExpandedValues().map(score => 
                <SimpleRaterCategoryDetailRow  score={score}  items={items.filter( it => it.song.score === score )} /> 
            )}
            </div>
            }
        </div>
        </div> 
}