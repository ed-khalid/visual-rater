import React from "react";
import { Scaler } from "../../functions/scale";
import { RatedSongItem } from "../../models/RatedItem";
import { RaterOrientation } from "./Rater";
import { SingleRaterItem } from "./SingleRaterItem";
import './MultiRaterItem.css'
import { RATER_BOTTOM } from "../../App";

interface MultiRaterItemProps {
    items:RatedSongItem[]
    orientation:RaterOrientation
    itemDimensions:{width:number,height:number}
    x:number
    y:number
    id:string
    scaler:Scaler
    onRemove:any
    onDragEnd:any
} 

export const MultiRaterItem = ({items, x, y, id, itemDimensions, scaler, onRemove, onDragEnd, orientation}:MultiRaterItemProps) =>  {

     const length = Math.min(items.length, 6)
     const totalWidth = (itemDimensions.width/2) * length  
     const startingPoint = x - (totalWidth/2)

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
             <rect id="multi-item-wrapper" cursor="pointer" x={startingPoint} y={y} width={totalWidth} height={itemDimensions.height}  fill="red" fillOpacity={0.5}></rect> 
             
             <g className="multi-item-group">
                    {sortedItems.map((item,i) => 
                    <SingleRaterItem 
                      orientation={orientation}
                      key={item.id}
                      scale={0.5}
                      item={item}
                      itemDimensions={{width:itemDimensions.width/2, height:itemDimensions.height}}
                      x={startingPoint+70+(i*(itemDimensions.width/2))}
                      raterBottom={RATER_BOTTOM}
                      y={y+30}
                      scaler={scaler}
                      onRemove={onRemove}
                      onDragEnd={onDragEnd}
                    />)}
                    </g>
            </g>   
}