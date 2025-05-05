import React from "react"
import { SongUIItem } from "../../models/ItemTypes"
import './GridRater.css'

interface Props {
    items: SongUIItem[] 
}

export const GridRater = ({items}:Props) => {

    const groupByScore = (items:SongUIItem[]) => {
        const retv:Record<number, SongUIItem[]|undefined> = {}  
        for (const item of items) {
            const score = item.score
            if (!retv[score]) {
                retv[score] = [] 
            } 
            retv[score].push(item) 
        }
        return retv
    }    
    const itemsByScore = groupByScore(items) 

    const populateCell = (rowIndex: number, colIndex: number) => {
        const score = 100 - (rowIndex * 10 + colIndex);
        if (itemsByScore[score]) {
            return itemsByScore[score].map ((item) => 
                 <div key={`grid-rater-item-${item.id}`} className="grid-rater-item" style={{ background: item.overlay }}>
                    <img src={item.thumbnail} alt={item.name} className="grid-rater-item-thumbnail" />
                    <div className="grid-rater-item-name">{item.name}</div>
                </div>
            ) 
        } else {
            return score
        }
    };

    return <div id="grid-rater">
            {/* Column headers */}
            <div>
            </div> {/* Empty top-left corner */}
            {Array.from({ length: 10 }, (_, i) => (
                <div key={`col-header-${10 - i}`} style={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {10 - i}
                </div>
            ))}

            {/* Rows with headers */}
            {Array.from({ length: 10 }, (_, rowIndex) => (
                <React.Fragment key={`row-${9 - rowIndex}`}>
                    <div style={{ fontWeight: 'bold', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px' }}>
                        {90 - rowIndex * 10}
                    </div>
                    {Array.from({ length: 10 }, (_, colIndex) => (
                        <div style={{ border: '1px solid #ccc', height: '60px', width: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {populateCell(rowIndex, colIndex)}
                        </div>
                    ))}
                </React.Fragment>
            ))}
    </div>
}