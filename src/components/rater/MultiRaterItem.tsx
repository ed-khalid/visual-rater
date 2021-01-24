import React, { useState } from "react";
import { RATER_BOTTOM } from "../../App";
import { Scaler } from "../../functions/scale";
import { RatedItem } from "../../models/RatedItem";
import { SingleRaterItem } from "./SingleRaterItem";

interface MultiRaterItemProps {
    items:RatedItem[]
    x:number
    y:number
    id:string
    scaler:Scaler
    onRemove:any
    onDragEnd:any
    zoomOnGroup:any
} 

export const MultiRaterItem = ({items, x, y, id, scaler, onRemove, onDragEnd, zoomOnGroup}:MultiRaterItemProps) =>  {

    const [isExploded, setisExploded] = useState<boolean>(false) 

    const explodeGroup =  () => {
        setisExploded(true)
    } 

       return <g>
             {items.map((item,i) => 
               <SingleRaterItem 
                 key={item.id}
                 scale={0.5}
                 item={item}
                 x={x}
                 raterBottom={RATER_BOTTOM}
                 y={y+i}
                 scaler={scaler}
                 onRemove={onRemove}
                 onDragEnd={onDragEnd}
               />)}
             </g>
            // :
            // <g id={'rater-item-'+id} className="groupedItems" key={"groupat"+y} onClick={() => zoomOnGroup(y)} onDoubleClick={explodeGroup}>
            // <rect id="itemSymbol" cursor="pointer" x={x-25} y={y} width={50} height={15}  fill="red" fillOpacity="0.5"></rect>
            // <text id="name" cursor="pointer" fontSize="8" fill="#3d3d3d" x={x-11} y={y+7} dy=".35em">{items.length} items</text>
      //  </g>   
}