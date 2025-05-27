import { useEffect } from "react";
import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import { Scaler } from "../../../functions/scale";
import { DragBehavior } from "./behaviors/DragBehavior";
import './SingleRaterItem.css' 
import { RatedItem } from "../../../src/models/CoreModels";
import { CARTESIAN_RATER_TIER_WIDTH, CARTESIAN_SVG_IMAGE_SIZE, CartesianRaterItem } from "../../models/CartesianRaterModels";

interface Props {
    item:CartesianRaterItem
    filterMode:boolean
    mainlineX:number
    highlightOnDrag:(item:SVGGElement, toggleOn:boolean) => void
    isReadonly:boolean
    nodeRef?:any
    onClick?:any
    duringDrag:(itemId:string, score:number) => void
    onDragEnd?:any
    onDragStart:(itemId:string) => void
    handleHover:(item:CartesianRaterItem, on:boolean) => void
    scaler:Scaler
    scale?:number
} 

export const CartesianRaterSingleItem = ({item, nodeRef, filterMode, isReadonly, highlightOnDrag, duringDrag, mainlineX, scale=1, scaler, onClick, onDragStart, handleHover, onDragEnd}:Props) =>  {
    const y = scaler.toPosition(item.score) 
    const tierOffset = CARTESIAN_RATER_TIER_WIDTH * item.tier!
    const x = (mainlineX + tierOffset) 


    useEffect(() => {
        const onDragBehaviorEnd = (id:string, score:number) => {
            onDragEnd(id, score)
        }
        if (!isReadonly && item.nodeRef.current) {
            const dragBehavior = DragBehavior({item, g: item.nodeRef.current, scaler, highlightOnDrag, onDragStart, duringDrag, onDragEnd:onDragBehaviorEnd}) 
            select(item.nodeRef.current).call(drag<SVGGElement,any>()
                .on('start', dragBehavior.dragStart)
                .on('drag', dragBehavior.dragInProgress)
                .on('end', dragBehavior.dragEnd))
        select(item.nodeRef.current).data<RatedItem>([item])
        }
    },[isReadonly, item, scaler, onDragEnd, item.nodeRef, highlightOnDrag, onDragStart, duringDrag]) 

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

    const imageSize = CARTESIAN_SVG_IMAGE_SIZE 
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
                x1: imageDimensions.x + imageDimensions.size, 
                y1: y, 
                x2: mainlineX,
                y2: y
            }

        
            // string is (r,g,b)
        const determineTextColor = (color:string|undefined|null) => {
            if (color === null || color === undefined) {
                return "black"
            }
            const arr = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/) 
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
                            return '#bccddf';
                        }
            } else return 'black'
        } 

        const handleOnClick = () => {
            if (onClick) {
                onClick(item)
            }
        }

        const formatScore = (score:number) => {

            // has decimals
            if (score % 1 !== 0)  {
                return score.toFixed(1) 
            }
            return Math.round(score) 
        }  

        const color = "rgb(" + item.overlay + ")"  
        const cursor = filterMode ? "crosshair" : (isReadonly) ? "pointer" : "move"  
        
        return <g onMouseEnter={() => handleHover(item, true)} onMouseLeave={() => handleHover(item, false) } onClick={handleOnClick} clipPath={ "url(#item-clip-path-right)"  } ref={nodeRef}  className="item draggable"> 
                    {item.shouldDrawLine && <line className="rater-item item-scoreline" x1={lineDimensions.x1} y1={lineDimensions.y1} x2={lineDimensions.x2} y2={lineDimensions.y2} stroke="rgb(145,153,161)" opacity={0.2} />}
                    <circle   className="rater-item item-thumbnail-overlay" cx={imageDimensions.x+imageDimensions.size/2} cy={imageDimensions.y+imageDimensions.size/2} r={imageDimensions.size/2} fill={color} stroke={color}></circle>
                    <image fill={"rgba("+item.overlay+")"} opacity={0.5} xlinkHref={item.thumbnail} clipPath="inset(0% round 45px)" cursor={cursor} className="rater-item item-thumbnail" width={imageDimensions.size} x={imageDimensions.x} y={imageDimensions.y} height={imageDimensions.size} href={item.thumbnail}/>
                    <text textAnchor="middle" className="rater-item item-name" cursor={cursor} fontSize={10*scale} fill="rgb(145,153,161)" x={songNameDimensions.x} y={songNameDimensions.y} dy=".35em">{formatName(item.name)}</text>
                    <text textAnchor="middle" className="rater-item item-score" cursor={cursor} fontSize={16*scale} fontWeight="bold" fill={determineTextColor(color)} x={songScoreDimensions.x} y={songScoreDimensions.y} dy=".35em">{formatScore(item.score)}</text>
                    <circle className="rater-item item-thumbnail-border" cx={imageDimensions.x+imageDimensions.size/2} cy={imageDimensions.y+imageDimensions.size/2} r={imageDimensions.size/2+2} fill="none" stroke={color}></circle>
               </g>


}