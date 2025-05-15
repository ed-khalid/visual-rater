import React from "react";
import { SongUIItem } from "../../../models/ItemTypes";
import { useDroppable } from "@dnd-kit/core";
import { GridRaterItemUI } from "./GridRaterItemUI";
import { mapSongScoreToUI } from "../../../functions/scoreUI";

interface Props {
    number:number;
    items:SongUIItem[]|undefined
}


export const GridRaterBlock = ({number, items}: Props) => {

    const {isOver, setNodeRef} = useDroppable({
        id: 'grid-rater-cell-' + number,
        data: {
            score: number
        }
    }) 
    const cellBackground = mapSongScoreToUI(number).color     
    const style = { color: isOver ? 'green': undefined } 

    const cellNumberClass= "grid-rater-cell-number" +( (items?.length) ? " corner" : "")   


    return <React.Fragment key={`grid-rater-cell-${number}`}>
             <div ref={setNodeRef} style={style}  className="grid-rater-cell">
                <div className={cellNumberClass} >
                   {number}
                </div>
                <div className="grid-rater-cell-items">
                    {items?.map((item) =>(
                        <GridRaterItemUI key={"grid-rater-item-" + item.id } item ={item}  />
                    ))}
                </div>
             </div>
          </React.Fragment>
}