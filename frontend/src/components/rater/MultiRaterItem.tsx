import React from "react";
import { Scaler } from "../../functions/scale";
import './MultiRaterItem.css'
import { RATER_BOTTOM } from "../../App";
import { RatedSongItemGrouped, RaterOrientation } from "./Rater";
import { SingleRaterItem } from "./SingleRaterItem";

interface MultiRaterItemProps {
    group:RatedSongItemGrouped
    orientation:RaterOrientation
    scaler:Scaler
    mainlineX:number
    itemShiftX:number
    onDragEnd:any
} 

export const MultiRaterItem = ({group, onDragEnd, mainlineX, itemShiftX, orientation, scaler }:MultiRaterItemProps) =>  {

       const lineX = mainlineX-itemShiftX 

       return <g className="groupedItems">
            <line x1={mainlineX} y1={group.position} x2={lineX} y2={group.position} stroke="black"></line> 
            {group.items.map((item,i) => 
            <g>
            <SingleRaterItem
              key={'multiline-tree-item-' + item.id + "-" + i }
              item={item}
              orientation={orientation}
              raterBottom={RATER_BOTTOM}
              mainlineX={mainlineX}
              x={lineX-(70*i)}
              y={group.position}
              scaler={scaler}
              onDragEnd={onDragEnd}
              isPartOfGroup={true}
              isFirstItemInGroup={i === 0}
             />
            </g>
        )}
    </g> 
}