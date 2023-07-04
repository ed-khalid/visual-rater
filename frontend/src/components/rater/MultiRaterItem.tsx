import React from "react";
import { Scaler } from "../../functions/scale";
import { RatedSongItem } from "../../models/RatedItem";
import { SingleRaterItem } from "./SingleRaterItem";
import './MultiRaterItem.css'
import { RATER_BOTTOM } from "../../App";

interface MultiRaterItemProps {
    items:RatedSongItem[]
    x:number
    y:number
    id:string
    scaler:Scaler
    onDragEnd:any
} 

export const MultiRaterItem = ({items, x, y, id, scaler, onDragEnd }:MultiRaterItemProps) =>  {

     const scale = 1 - (0.1 * items.length)
     const xScale = 100 

     const sortedItems = items.sort((a,b) => {
      if (a.score > b.score) {
        return -1
      }
      if (a.score < b.score) {
        return 1
      }
      return 0
     }) 


       return <g id={'rater-item-'+id} className="groupedItems" key={"groupat"+y}>
             <g className="multi-item-group">
                    {sortedItems.map((item,i) => 
                    <SingleRaterItem 
                      key={item.id}
                      scale={scale}
                      multiItemLineLength={(i*xScale)}
                      item={item}
                      x={x}
                      raterBottom={RATER_BOTTOM}
                      y={scaler.toPosition(item.score)}
                      scaler={scaler}
                      onDragEnd={onDragEnd}
                    />)}
                    </g>
            </g>   
}