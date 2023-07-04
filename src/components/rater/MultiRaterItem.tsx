import React from "react";
import { Scaler } from "../../functions/scale";
import { RatedSongItem } from "../../models/RatedItem";
import { SingleRaterItem } from "./SingleRaterItem";
import './MultiRaterItem.css'
import { RATER_BOTTOM } from "../../App";
import { RaterOrientation } from "./Rater";
import { RaterTree } from "./RaterTree";

interface MultiRaterItemProps {
    items:RatedSongItem[]
    orientation:RaterOrientation
    x:number
    y:number
    id:string
    scaler:Scaler
    onDragEnd:any
} 

export const MultiRaterItem = ({items, orientation, x, y, id, scaler, onDragEnd }:MultiRaterItemProps) =>  {

     // sort by score
     const sortedItems = items.sort((a,b) => {
      if (a.score > b.score) {
        return -1
      }
      if (a.score < b.score) {
        return 1
      }
      return 0
     }) 
     // get first item to render it normally 
     const firstItem = sortedItems[0]  
     const otherItems = sortedItems.slice(1) 
       return <g id={'rater-item-'+id} className="groupedItems" key={"groupat"+y}>
                    <SingleRaterItem 
                      key={firstItem.id}
                      item={firstItem}
                      orientation={orientation}
                      x={x}
                      raterBottom={RATER_BOTTOM}
                      y={scaler.toPosition(firstItem.score)}
                      scaler={scaler}
                      onDragEnd={onDragEnd}/>
             <g className="multi-item-group">
                    <RaterTree 
                      key={'rater-leaf'}
                      orientation={orientation}
                      items={otherItems}
                      x={x}
                      raterBottom={RATER_BOTTOM}
                      y={y}
                      scaler={scaler}
                      onDragEnd={onDragEnd}
                      />
                    </g>
            </g>   
}