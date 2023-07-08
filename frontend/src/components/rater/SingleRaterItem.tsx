import React, {useEffect, useRef } from "react";
import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import { RatedSongItemUI } from "../../models/ui/ItemTypes";
import { Scaler } from "../../functions/scale";
import { DragBehavior } from "./behaviors/DragBehavior";
import './SingleRaterItem.css' 
import { RatedItem } from "../../models/domain/ItemTypes";
import { RATER_TIER_WIDTH, RaterOrientation } from "../../models/ui/RaterTypes";

interface SingleRaterItemProps {
    item:RatedSongItemUI
    mainlineX:number
    onDragEnd:any
    scaler:Scaler
    scale?:number
    orientation:RaterOrientation
} 

export const SingleRaterItem = ({item, orientation , mainlineX, scale=1, scaler, onDragEnd}:SingleRaterItemProps) =>  {
    const y = scaler.toPosition(item.score) 
    const tierOffset = RATER_TIER_WIDTH * item.tier 
    const tierLineOpacityOffset = 0.2 * item.tier   
    const x = (orientation === RaterOrientation.LEFT) ?(mainlineX - tierOffset) : (mainlineX + tierOffset) 
    const g = useRef<SVGGElement>(null)
    const onDragBehaviorEnd = (id:string, score:number) => {
        onDragEnd(id, score)
    }

    const formatName= (name:string) => {
        if (name.length <= 20 ) {
            return name
        }
        return name.slice(0,10) + '...'
    }

    useEffect(() => {
        if (g.current) {
            const dragBehavior = DragBehavior({item, g:g.current, scaler, onDragEnd:onDragBehaviorEnd}) 
            select(g.current).call(drag<SVGGElement,any>()
                .on('start', dragBehavior.dragStart)
                .on('drag', dragBehavior.dragInProgress)
                .on('end', dragBehavior.dragEnd))
           select(g.current).data<RatedItem>([item])
        }
    },[g.current]) 
    const imageSize = 20
        const lineDistance = x 
        const imageDimensions =  {
            x: lineDistance,
            y: y - imageSize/2,
            size:imageSize
        }  
        const songNameDimensions = {
            x: (orientation === RaterOrientation.LEFT) ? (imageDimensions.x + imageDimensions.size + 5) : (imageDimensions.x - imageDimensions.size - 35)  ,
            y: y - 7  
        }  
        const songScoreDimensions = {
            x: (orientation === RaterOrientation.LEFT ) ? songNameDimensions.x: songNameDimensions.x + 30,
            y: songNameDimensions.y + 14 
        }  
        const lineDimensions = {
                x1: (orientation === RaterOrientation.LEFT) ? (imageDimensions.x + imageDimensions.size) : imageDimensions.x + imageDimensions.size, 
                y1: y, 
                x2: mainlineX,
                y2: y
            }
        
        return <g ref={g} className="item" key={item.name}>
                        <g className="draggable"> 
                            <image xlinkHref={item.thumbnail} clipPath="inset(0% round 15px)" cursor="move" className="item-thumbnail" width={imageDimensions.size} x={imageDimensions.x} y={imageDimensions.y} height={imageDimensions.size} href={item.thumbnail}/>
                            <circle className="item-thumbnail-border" cx={imageDimensions.x+10} cy={imageDimensions.y+10} r={imageDimensions.size/2} fill="none" stroke="black"></circle>
                            <line className="item-scoreline" x1={lineDimensions.x1} y1={lineDimensions.y1} x2={lineDimensions.x2} y2={lineDimensions.y2} stroke="black" opacity={1-tierLineOpacityOffset}/>
                            <text className="item-name" cursor="move" fontSize={8*scale} fontSizeAdjust="2" fill="#3d3d3d" x={songNameDimensions.x} y={songNameDimensions.y} dy=".35em">{formatName(item.name)}</text>
                            <text className="item-score" cursor="move" fontSize={10*scale} fontWeight="bold" fontSizeAdjust="3" fill="#3d3d3d" x={songScoreDimensions.x} y={songScoreDimensions.y} dy=".35em">{item.score.toFixed(2)}</text>
                        </g>
                </g>


}