import React from "react";
import { RatedItem } from "../../models/RatedItem";

interface MultiRaterItemProps {
    items:RatedItem[]
    x:number
    y:number
    zoomOnGroup:any
} 

export const MultiRaterItem = ({items, x, y, zoomOnGroup}:MultiRaterItemProps) =>  {
       return <g className="groupedItems" key={"groupat"+y} onClick={() => zoomOnGroup(y)}>
            <rect id="itemSymbol" cursor="pointer" x={x-25} y={y} width={50} height={15}  fill="red" fillOpacity="0.5"></rect>
            <text id="name" cursor="pointer" fontSize="8" fill="#3d3d3d" x={x-11} y={y+7} dy=".35em">{items.length} items</text>
       </g>   
}