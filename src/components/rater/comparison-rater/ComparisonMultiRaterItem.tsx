import React from "react";
import './ComparisonMultiRaterItem.css'
import { RatedItem } from "../../../models/domain/ItemTypes";

interface Props {
    items:RatedItem[]
    x:number
    y:number
    id:string
} 

export const ComparisonMultiRaterItem = ({items, x, y, id }:Props) =>  {
       return <g id={'rater-item-'+id} className="read-only groupedItems" key={"groupat"+y}>
               <circle className="multi-item-symbol" cx={x} cy={y} r="5" fill="#3d3d3d" fillOpacity="0.5"></circle>
               <text id="name" x={x+50} y={y} dy=".35em">{items.length} items</text>
       </g>   
}