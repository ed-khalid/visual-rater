import React, { RefObject } from "react";
import { SongUIItem } from "../../../models/ItemTypes";
import { useDroppable } from "@dnd-kit/core";
import { GridRaterItemUI } from "./GridRaterItemUI";
import { mapSongScoreToUI } from "../../../functions/scoreUI";

interface Props {
    number:number;
    items:SongUIItem[]|undefined
    isFirstInRow:boolean
    rowIndex: number
    rowRef?:RefObject<HTMLDivElement>
}


export const GridRaterBlock = ({number, items, isFirstInRow, rowIndex, rowRef}: Props) => {

    const {isOver, setNodeRef} = useDroppable({
        id: 'grid-rater-cell-' + number,
        data: {
            score: number
        }
    }) 
    const cellBackground = mapSongScoreToUI(number).color     
    const cellDescription = mapSongScoreToUI(number).category  
    const style = { color: isOver ? 'green': undefined } 



    return <React.Fragment key={`grid-rater-cell-${number}`}>
             <div ref={setNodeRef} className="grid-rater-cell">
                <div data-row={isFirstInRow? rowIndex: undefined} ref={isFirstInRow? rowRef: undefined} style={{backgroundColor: cellBackground}} className="grid-rater-ribbon">
                    <div className="grid-rater-ribbon-number">
                        {number}
                    </div>
                    <div   className="grid-rater-ribbon-text">
                        {cellDescription}
                    </div>
                </div>
                <div className="grid-rater-cell-items">
                    {items?.map((item) =>(
                        <GridRaterItemUI isUnrated={false} key={"grid-rater-item-" + item.id } item ={item}  />
                    ))}
                </div>
             </div>
          </React.Fragment>
}