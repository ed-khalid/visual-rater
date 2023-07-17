import React, {useEffect, useRef } from "react";
import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import { RatedMusicItemUI } from "../../models/ui/ItemTypes";
import { Scaler } from "../../functions/scale";
import { DragBehavior } from "./behaviors/DragBehavior";
import './SingleRaterItem.css' 
import { RatedItem } from "../../models/domain/ItemTypes";
import { RATER_TIER_WIDTH, RaterOrientation } from "../../models/ui/RaterTypes";

interface SingleRaterItemProps {
    item:RatedMusicItemUI
    mainlineX:number
    isReadonly:boolean
    nodeRef?:any
    onClick?:any
    onDragEnd?:any
    scaler:Scaler
    scale?:number
} 

export const SingleRaterItem = ({item, nodeRef, isReadonly, mainlineX, scale=1, scaler, onClick, onDragEnd}:SingleRaterItemProps) =>  {
    const y = scaler.toPosition(item.score) 
    const tierOffset = RATER_TIER_WIDTH * item.tier 
    const x = (item.orientation === RaterOrientation.LEFT) ?(mainlineX - tierOffset) : (mainlineX + tierOffset) 
    const g = useRef<SVGGElement>(null)

    useEffect(() => {
        const onDragBehaviorEnd = (id:string, score:number) => {
            onDragEnd(id, score)
        }
        if (!isReadonly && g.current) {
            const dragBehavior = DragBehavior({item, g:g.current, scaler, onDragEnd:onDragBehaviorEnd}) 
            select(g.current).call(drag<SVGGElement,any>()
                .on('start', dragBehavior.dragStart)
                .on('drag', dragBehavior.dragInProgress)
                .on('end', dragBehavior.dragEnd))
        select(g.current).data<RatedItem>([item])
        }
    },[isReadonly, item, scaler, onDragEnd]) 

    const formatName= (name:string) => {
        const maxLength = 15
        if (name.length < maxLength ) {
            return name
        }
        if (name.length >= maxLength) {
            name = name.slice(0,maxLength) 
        }
        return name.split(" ").slice(0,3).join(" ")
    }

    const imageSize = 25 
        const lineDistance = x 
        const imageDimensions =  {
            x: mainlineX-imageSize/2,
            y: y - imageSize/2,
            size:imageSize
        }  
        const songNameDimensions = {
            x: (imageDimensions.x + imageDimensions.size/2 ),
            y: imageDimensions.y - 5      
        }  
        const songScoreDimensions = {
            x: songNameDimensions.x,
            y: imageDimensions.y + imageSize/2   
        }  
        const lineDimensions = {
                x1: (item.orientation === RaterOrientation.LEFT) ? (imageDimensions.x + imageDimensions.size) : imageDimensions.x + imageDimensions.size, 
                y1: y, 
                x2: mainlineX,
                y2: y
            }

        
            // string is (r,g,b)
        const determineTextColor = (color:string|undefined|null) => {
            if (color === null || color === undefined) {
                return "black"
            }
            const arr = color.match(/^\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/) 
            if (arr) {
                        const r = Number(arr[1])
                        const g = Number(arr[2])
                        const b = Number(arr[3])
            // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
                    const hsp = Math.sqrt(
                    0.299 * (r * r) +
                    0.587 * (g * g) +
                    0.114 * (b * b)
                    );

                // Using the HSP value, determine whether the color is light or dark
                        if (hsp>127.5) {
                            return 'black';
                        } 
                        else {
                            return 'white';
                        }
            } else return 'black'
        } 

        const handleOnClick = () => {
            if (onClick) {
                onClick(item)
            }
        }

        const color = "rgb" + item.overlay   
        const cursor = (isReadonly) ? "pointer" : "move"  
        
        return <g onClick={handleOnClick} ref={g} className="item" key={'single-rater-item-svg-g-'+item.name}>
                        <g clipPath={ (item.orientation === RaterOrientation.LEFT) ? "url(#item-clip-path-left)" : "url(#item-clip-path-right)"  } ref={nodeRef}  className="draggable"> 
                            <line className="item-scoreline" x1={lineDimensions.x1} y1={lineDimensions.y1} x2={lineDimensions.x2} y2={lineDimensions.y2} stroke={"black"} opacity={0.2} />
                            <circle  className="item-thumbnail-overlay" cx={imageDimensions.x+imageDimensions.size/2} cy={imageDimensions.y+imageDimensions.size/2} r={imageDimensions.size/2} fill={color} stroke={color}></circle>
                            <image fill={"rgba"+item.overlay} opacity={0.5} xlinkHref={item.thumbnail} clipPath="inset(0% round 15px)" cursor={cursor} className="item-thumbnail" width={imageDimensions.size} x={imageDimensions.x} y={imageDimensions.y} height={imageDimensions.size} href={item.thumbnail}/>
                            <text textAnchor="middle" className="item-name" cursor={cursor} fontSize={6*scale} fill="black" x={songNameDimensions.x} y={songNameDimensions.y} dy=".35em">{formatName(item.name)}</text>
                            <text textAnchor="middle" className="item-score" cursor={cursor} fontSize={10*scale} fontWeight="bold" fill={determineTextColor(item.overlay)} x={songScoreDimensions.x} y={songScoreDimensions.y} dy=".35em">{item.score.toFixed(2)}</text>
                            <circle className="item-thumbnail-border" cx={imageDimensions.x+imageDimensions.size/2} cy={imageDimensions.y+imageDimensions.size/2} r={imageDimensions.size/2+2} fill="none" stroke={color}></circle>
                        </g>
                </g>


}