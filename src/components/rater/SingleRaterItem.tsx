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
    const tierLineOpacityOffset = 0.7 
    const x = (orientation === RaterOrientation.LEFT) ?(mainlineX - tierOffset) : (mainlineX + tierOffset) 
    const g = useRef<SVGGElement>(null)
    const onDragBehaviorEnd = (id:string, score:number) => {
        onDragEnd(id, score)
    }

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
    const imageSize = 25 
        const lineDistance = x 
        const imageDimensions =  {
            x: lineDistance,
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
                x1: (orientation === RaterOrientation.LEFT) ? (imageDimensions.x + imageDimensions.size) : imageDimensions.x + imageDimensions.size, 
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

        
        const drawArc = (x:number, y:number, radius:number, startAngle:number, endAngle:number) => {

            const polarToCarestian = (centerX:number, centerY:number, radius:number,angleInDegrees:number) => {
                const angleRadians = (angleInDegrees - 90) * Math.PI / 180.0 ; 
                return {
                    x : centerX + (radius * Math.cos(angleRadians)),
                    y : centerY + (radius * Math.sin(angleRadians))
                }
            } 

            const start = polarToCarestian(x,y,radius,endAngle) 
            const end = polarToCarestian(x,y,radius,startAngle) 
            const largeArcFlag =  endAngle - startAngle <= 180 ? "0" : "1"
            const d = [
                "M", start.x, start.y,
                "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
            ].join(" ") 
            return d

        }
        const color = "rgb" + item.overlay   
        const arcPath = drawArc(imageDimensions.x, imageDimensions.y, imageDimensions.size/2, 180, 0)  
        
        return <g ref={g} className="item" key={item.name}>
                        <g className="draggable"> 
                            <filter id="shadow">
                                <feDropShadow dx="0.2" dy="0.4" stdDeviation={0.2} />
                            </filter>
                            <line className="item-scoreline" x1={lineDimensions.x1} y1={lineDimensions.y1} x2={lineDimensions.x2} y2={lineDimensions.y2} stroke={color} opacity={1-tierLineOpacityOffset} />
                            <circle className="item-thumbnail-overlay" cx={imageDimensions.x+imageDimensions.size/2} cy={imageDimensions.y+imageDimensions.size/2} r={imageDimensions.size/2} fill={color} stroke={color}></circle>
                            <image fill={"rgba"+item.overlay} opacity={0.5} xlinkHref={item.thumbnail} clipPath="inset(0% round 15px)" cursor="move" className="item-thumbnail" width={imageDimensions.size} x={imageDimensions.x} y={imageDimensions.y} height={imageDimensions.size} href={item.thumbnail}/>
                            <text textAnchor="middle" className="item-name" cursor="move" fontSize={6*scale} fill="black" x={songNameDimensions.x} y={songNameDimensions.y} dy=".35em">{formatName(item.name)}</text>
                            <text textAnchor="middle" className="item-score" cursor="move" fontSize={10*scale} fontWeight="bold" fill={determineTextColor(item.overlay)} x={songScoreDimensions.x} y={songScoreDimensions.y} dy=".35em">{item.score.toFixed(2)}</text>
                            <circle className="item-thumbnail-border" cx={imageDimensions.x+imageDimensions.size/2} cy={imageDimensions.y+imageDimensions.size/2} r={imageDimensions.size/2} fill="none" stroke={color}></circle>
                        </g>
                </g>


}