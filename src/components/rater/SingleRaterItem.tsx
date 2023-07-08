import React, {useEffect, useRef } from "react";
import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import { RatedSongItemUI } from "../../models/ui/ItemTypes";
import { Scaler } from "../../functions/scale";
import { DragBehavior } from "./behaviors/DragBehavior";
import { RaterOrientation } from "./Rater";
import './SingleRaterItem.css' 
import { RatedItem } from "../../models/domain/ItemTypes";

interface SingleRaterItemProps {
    item:RatedSongItemUI
    x:number
    mainlineX:number
    y:number
    raterBottom:number
    onDragEnd:any
    scaler:Scaler
    scale?:number
    orientation:RaterOrientation
    isPartOfGroup?:boolean
    isFirstItemInGroup?:boolean
} 

export const SingleRaterItem = ({item, orientation , isPartOfGroup, isFirstItemInGroup, mainlineX,x, y, scale=1, raterBottom, scaler, onDragEnd}:SingleRaterItemProps) =>  {
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
    if (!isPartOfGroup) {
        const lineDistance = x 
        const imageDimensions =  {
            x: (orientation === RaterOrientation.LEFT) ?  mainlineX- lineDistance : mainlineX + lineDistance,
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
                            <line className="item-scoreline" x1={lineDimensions.x1} y1={lineDimensions.y1} x2={lineDimensions.x2} y2={lineDimensions.y2} stroke="black"/>
                            <text className="item-name" cursor="move" fontSize={8*scale} fontSizeAdjust="2" fill="#3d3d3d" x={songNameDimensions.x} y={songNameDimensions.y} dy=".35em">{formatName(item.name)}</text>
                            <text className="item-score" cursor="move" fontSize={10*scale} fontWeight="bold" fontSizeAdjust="3" fill="#3d3d3d" x={songScoreDimensions.x} y={songScoreDimensions.y} dy=".35em">{item.score.toFixed(2)}</text>
                        </g>
                </g>

    } else  {

        const imageDimensions =  {
            x: x,
            y: y - imageSize/2,
            size:imageSize
        }  
        const songNameDimensions = (isFirstItemInGroup) ? {
            x: (orientation === RaterOrientation.LEFT) ? (imageDimensions.x + imageDimensions.size + 5) : (imageDimensions.x - imageDimensions.size - 35)  ,
            y: y - 7  
        }  : {
            x: (orientation === RaterOrientation.LEFT) ? (imageDimensions.x + imageDimensions.size - 35 ) : (imageDimensions.x - imageDimensions.size - 35)  ,
            y: y - 17  
        }
        const songScoreDimensions = (isFirstItemInGroup) ? {
            x: (orientation === RaterOrientation.LEFT ) ? songNameDimensions.x: songNameDimensions.x + 30,
            y: songNameDimensions.y + 14 
        }  : {
            x: (orientation === RaterOrientation.LEFT ) ? songNameDimensions.x + 15: songNameDimensions.x + 30,
            y: songNameDimensions.y + 34 
        }
        
        return <g ref={g} className="item" key={item.name}>
                        <g className="draggable"> 
                            <image xlinkHref={item.thumbnail} clipPath="inset(0% round 15px)" cursor="move" className="item-thumbnail" width={imageDimensions.size} x={imageDimensions.x} y={imageDimensions.y} height={imageDimensions.size} href={item.thumbnail}/>
                            <circle className="item-thumbnail-border" cx={imageDimensions.x+10} cy={imageDimensions.y+10} r={imageDimensions.size/2} fill="none" stroke="black"></circle>
                            <text className="item-name" cursor="move" fontSize={8*scale} fontSizeAdjust="2" fill="#3d3d3d" x={songNameDimensions.x} y={songNameDimensions.y} dy=".35em">{formatName(item.name)}</text>
                            <text className="item-score" cursor="move" fontSize={10*scale} fontWeight="bold" fontSizeAdjust="3" fill="#3d3d3d" x={songScoreDimensions.x} y={songScoreDimensions.y} dy=".35em">{item.score.toFixed(2)}</text>
                        </g>
                </g>
    }
}