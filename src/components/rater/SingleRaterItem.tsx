import React, {useEffect, useRef } from "react";
import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import { RatedItem, RatedSongItem } from "../../models/RatedItem";
import { Scaler } from "../../functions/scale";
import { DragBehavior } from "./behaviors/DragBehavior";
import { RaterOrientation } from "./Rater";
import './SingleRaterItem.css' 

interface SingleRaterItemProps {
    item:RatedSongItem
    x:number
    y:number
    raterBottom:number
    onDragEnd:any
    scaler:Scaler
    scale?:number
    orientation:RaterOrientation
    isLeaf?:boolean
} 

export const SingleRaterItem = ({item, orientation , isLeaf, x, y, scale=1, raterBottom, scaler, onDragEnd}:SingleRaterItemProps) =>  {
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
    const imageSize = 20
    const lineDistance = (isLeaf) ? 70 : 100
    const imageDimensions =  {
        x: (orientation === RaterOrientation.LEFT) ?  x- lineDistance : x + lineDistance,
        y: y - imageSize/2,
        size:imageSize
    }  
    const songNameDimensions = {
        x: imageDimensions.x + imageDimensions.size + 5 ,
        y: y - 7  
    }  
    const songScoreDimensions = {
        x: songNameDimensions.x,  
        y: songNameDimensions.y + 14 
    }  
    const lineDimensions = {
        x1: imageDimensions.x + imageDimensions.size, 
        y1: y, 
        x2: x,
        y2: y
    }

      return <g ref={g} className="item" key={item.name}>
                       <g className="draggable"> 
                         <image xlinkHref={item.thumbnail} clipPath="inset(0% round 15px)" cursor="move" className="item-thumbnail" width={imageDimensions.size} x={imageDimensions.x} y={imageDimensions.y} height={imageDimensions.size} href={item.thumbnail}/>
                         <circle className="item-thumbnail-border" cx={imageDimensions.x+10} cy={imageDimensions.y+10} r={imageDimensions.size/2} fill="none" stroke="black"></circle>
                         <line className="item-scoreline" x1={lineDimensions.x1} y1={lineDimensions.y1} x2={lineDimensions.x2} y2={lineDimensions.y2} stroke="black"/>
                         <text className="item-name" cursor="move" fontSize={8*scale} fontSizeAdjust="2" fill="#3d3d3d" x={songNameDimensions.x} y={songNameDimensions.y} dy=".35em">{formatName(item.name)}</text>
                         <text className="item-score" cursor="move" fontSize={10*scale} fontWeight="bold" fontSizeAdjust="3" fill="#3d3d3d" x={songScoreDimensions.x} y={songScoreDimensions.y} dy=".35em">{item.score.toFixed(2)}</text>
                       </g>
              </g>
}