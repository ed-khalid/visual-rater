import React, {useEffect, useRef } from "react";
import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import { RatedItem } from "../../models/RatedItem";
import { Scaler } from "../../functions/scale";
import { DragBehavior } from "./behaviors/DragBehavior";
import { RaterOrientation } from "./Rater";
import { CloseButton } from "./CloseButton";

interface SingleRaterItemProps {
    item:RatedItem
    orientation:RaterOrientation
    x:number
    y:number
    raterBottom:number
    onRemove:any
    onDragEnd:any
    scaler:Scaler
    scale?:number
} 

export const SingleRaterItem = ({item, orientation, x, y, scale=1, raterBottom, scaler, onRemove, onDragEnd}:SingleRaterItemProps) =>  {
    const g = useRef<SVGGElement>(null)
    const onDragBehaviorEnd = (id:string, score:number) => {
        onDragEnd(id, score)
    }

    const formatName= (name:string) => {
        if (name.length <= 20 ) {
            return name
        }
        return name.slice(0,20) + '...'
    }

    useEffect(() => {
        if (g.current) {
            const dragBehavior = DragBehavior({raterBottom, item, g:g.current, scaler, onDragEnd:onDragBehaviorEnd}) 
            select(g.current).call(drag<SVGGElement,any>()
                .on('start', dragBehavior.dragStart)
                .on('drag', dragBehavior.dragInProgress)
                .on('end', dragBehavior.dragEnd))
           select(g.current).data<RatedItem>([item])
        }
    },[g.current]) 

      return <g ref={g} className="item" key={item.name}>
                       <CloseButton position={orientation === RaterOrientation.LEFT ? {x:x-220, y:y+3} : { x: x+280, y:y+3  }} onClick={() => onRemove(item)}></CloseButton>
                       <g id="item" className={`draggable ${orientation === RaterOrientation.LEFT ? 'main-rater-item' : 'secondary'  }`}> 
                         <circle className="item-symbol" cursor="move" cx={x} cy={y} r={5*scale} fill="#3d3d3d" fillOpacity="0.5"></circle>
                         <text className="item-score" cursor="move" fontSize={12*scale} fontSizeAdjust="2" fill="#3d3d3d" x={orientation ===  RaterOrientation.LEFT ? (x-210):(x+70) } y={y} dy=".35em">{item.score.toFixed(2)}</text>
                         <text className="item-name" cursor="move" fontSize={12*scale} fontSizeAdjust="2" fill="#3d3d3d" x={orientation === RaterOrientation.LEFT ? (x-170):(x+100)} y={y} dy=".35em">{formatName(item.name)}</text>
                       </g>
              </g>
}