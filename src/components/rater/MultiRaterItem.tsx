import React from "react";
import { Scaler } from "../../functions/scale";
import './MultiRaterItem.css'
import { RatedSongItemGrouped } from "./Rater";
import { SingleRaterItem } from "./SingleRaterItem";
import { RATER_Y_BOTTOM, RaterOrientation } from "../../models/ui/RaterTypes";

interface MultiRaterItemProps {
    group:RatedSongItemGrouped
    orientation:RaterOrientation
    scaler:Scaler
    mainlineX:number
    onDragEnd:any
} 

export const MultiRaterItem = ({group, onDragEnd, mainlineX, orientation, scaler }:MultiRaterItemProps) =>  {


       return <g className="groupedItems">
            {group.items.map((item,i) => 
            <g>
            <SingleRaterItem
              key={'multiline-tree-item-' + item.id + "-" + i }
              item={item}
              orientation={orientation}
              mainlineX={mainlineX}
              scaler={scaler}
              onDragEnd={onDragEnd}
             />
            </g>
        )}
    </g> 
}