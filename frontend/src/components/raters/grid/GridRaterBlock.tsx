import React from "react";
import { SongUIItem } from "../../../models/ItemTypes";
import { useDroppable } from "@dnd-kit/core";
import { GridRaterItemUI } from "./GridRaterItemUI";

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
    const style = { color: isOver? 'green': undefined } 


    return <React.Fragment key={`grid-rater-cell-${number}`}>
             <div ref={setNodeRef} style={style}  className="grid-rater-cell">
                {number}
                {items?.map((item) =>(
                    <GridRaterItemUI key={"grid-rater-item-" + item.id } item ={item}  />
                ))}
             </div>
          </React.Fragment>
}