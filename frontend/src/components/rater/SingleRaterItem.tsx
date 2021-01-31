import React, { Dispatch, SetStateAction, useState } from "react";
import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import { RatedItem } from "../../models/RatedItem";
import { Scaler } from "../../functions/scale";
import { DragBehavior } from "./behaviors/DragBehavior";
import { RaterOrientation } from "./Rater";
import { CloseButton } from "./CloseButton";
import { Position } from "../../models/Position";

interface SingleRaterItemProps {
    item:RatedItem
    orientation:RaterOrientation
    x:number
    y:number
    dragPoint:Position|undefined
    setDragPoint:Dispatch<SetStateAction<Position|undefined>>
    raterBottom:number
    onRemove:any
    onDragEnd:any
    scaler:Scaler
    scale?:number
} 

export const SingleRaterItem = ({item, orientation, x, y, scale=1, raterBottom, dragPoint, setDragPoint, scaler, onRemove, onDragEnd}:SingleRaterItemProps) =>  {
    const [g,setG] = useState<SVGGElement|undefined>()
    const onDragBehaviorEnd = (id:string, score:number) => {
        onDragEnd(id, score)
    }
    const dragBehavior = DragBehavior({raterBottom, item, g, scaler, dragPoint, setDragPoint, onDragEnd:onDragBehaviorEnd}) 

    const formatName= (name:string) => {
        if (name.length <= 20 ) {
            return name
        }
        return name.slice(0,20) + '...'
    }


    const attachDrag = (g:SVGGElement|null) => {
        if (g) {
            select(g).call(drag<SVGGElement,any>()
                .on('start', dragBehavior.dragStart)
                .on('drag', dragBehavior.dragInProgress)
                .on('end', dragBehavior.dragEnd))
            setG(g)
        }
    } 
      return <g ref={it => attachDrag(it)} className="item" key={item.name}>
                       <CloseButton position={orientation === RaterOrientation.LEFT ? {x:x-220, y:y+3} : { x: x+280, y:y+3  }} onClick={() => onRemove(item)}></CloseButton>
                       <g id="item" className={`draggable ${orientation === RaterOrientation.LEFT ? 'main-rater-item' : 'secondary'  }`}> 
                         <circle className="item-symbol" cursor="move" cx={x} cy={y} r={5*scale} fill="#3d3d3d" fillOpacity="0.5"></circle>
                         <text className="item-score" cursor="move" fontSize={12*scale} fontSizeAdjust="2" fill="#3d3d3d" x={orientation ===  RaterOrientation.LEFT ? (x-210):(x+70) } y={y} dy=".35em">{item.score.toFixed(2)}</text>
                         <text className="item-name" cursor="move" fontSize={12*scale} fontSizeAdjust="2" fill="#3d3d3d" x={orientation === RaterOrientation.LEFT ? (x-170):(x+100)} y={y} dy=".35em">{formatName(item.name)}</text>
                       </g>
              </g>
}