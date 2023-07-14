import React from "react";
import { Scaler } from "../../functions/scale";
import './MultiRaterItem.css'
import { SingleRaterItem } from "./SingleRaterItem";
import { RatedSongItemGrouped, RaterOrientation } from "../../models/ui/RaterTypes";

interface MultiRaterItemProps {
    group:RatedSongItemGrouped
    orientation:RaterOrientation
    isReadonly:boolean
    scaler:Scaler
    mainlineX:number
    onDragEnd?:any
    onClick?:any
} 

export const MultiRaterItem = ({group, onDragEnd, onClick, isReadonly, mainlineX, orientation, scaler }:MultiRaterItemProps) =>  {


       return <g className="groupedItems">
            {group.items.map((item,i) => 
            <g key={'multirater-item-g' + item.id}>
            <SingleRaterItem
              item={item}
              shouldDrawScoreline={ i === group.items.length-1}
              isReadonly={isReadonly}
              onClick={onClick}
              orientation={orientation}
              mainlineX={mainlineX}
              scaler={scaler}
              onDragEnd={onDragEnd}
             />
            </g>
        )}
    </g> 
}