import React from "react";
import { RATER_BOTTOM } from "../../App";
import { Scaler } from "../../functions/scale";
import { RatedItem } from "../../models/RatedItem";
import { RaterOrientation } from "./Rater";
import { SingleRaterItem } from "./SingleRaterItem";
import './MultiRaterItem.css'

interface MultiRaterItemProps {
    items:RatedItem[]
    orientation:RaterOrientation
    x:number
    y:number
    id:string
    scaler:Scaler
    onRemove:any
    onDragEnd:any
    zoomOnGroup:any
} 

export const MultiRaterItem = ({items, x, y, id, scaler, onRemove, onDragEnd, orientation, zoomOnGroup}:MultiRaterItemProps) =>  {

    // const [isExploded, setisExploded] = useState<boolean>(false) 

    // const explodeGroup =  () => {
    //     setisExploded(true)
    // } 

       return <g id={'rater-item-'+id} className="groupedItems" key={"groupat"+y} onClick={() => zoomOnGroup(y)}>
             {/* <rect id="itemSymbol" cursor="pointer" x={x-25} y={y} width={50} height={15}  fill="red" fillOpacity="0.5"></rect> */}
              <text className="multi-title" fontSizeAdjust="2" x={orientation ===  RaterOrientation.LEFT ? (x-170):(x+100) } y={y} dy=".35em">{items[0].name} &amp; {items.length-1} others</text>
              <circle className="multi-item-symbol" cx={x} cy={y} r={5}></circle>
              {/* <text className="item-name" cursor="move" fontSize={12*scale} fontSizeAdjust="2" fill="#3d3d3d" x={orientation === RaterOrientation.LEFT ? (x-170):(x+100)} y={y} dy=".35em">{formatName(item.name)}</text> */} 
            </g>   
      //  <g>
             {/* {items.map((item,i) => 
               <SingleRaterItem 
                 orientation={orientation}
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
             </g> */}
            {/* // : */}
}