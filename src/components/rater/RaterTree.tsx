
import React from 'react'
import { RatedSongItem } from '../../models/RatedItem'
import { RaterOrientation } from './Rater'
import { Scaler } from '../../functions/scale'
import { SingleRaterItem } from './SingleRaterItem'
interface RaterTreeProps{
    items:Array<RatedSongItem>
    scale?:number
    scaler:Scaler
    orientation:RaterOrientation
    raterBottom:number
    x:number
    y:number
    onDragEnd:any
}




export const RaterTree = ({items,raterBottom,orientation,x,y,scaler, scale=1, onDragEnd}:RaterTreeProps) => {
    const circleDivisions = items.length + 1;   
    const step = Math.PI / circleDivisions   
    const anchor = 90 * (Math.PI/180); 
    const allCoords = [] 
    const radius = 60; 
    for (let i=0 ; i<= circleDivisions ; i++) {
        const cos = radius * Math.cos(anchor + (i*step) ) 
        const sin = radius * Math.sin(anchor + (i*step) ) 
        allCoords.push({x:cos, y:sin})
    } 
    const coords =  allCoords.slice(1,-1)
    return <g>
        <line x1={x} y1={y} x2={x-150} y2={y} stroke="black"></line>
        {coords.map((coord,i) => 
            <g>
            <line key={"coord"+i} x1={x-150} y1={y} x2={coord.x +(x-150)} y2={y- coord.y} stroke="black"></line>
            <SingleRaterItem
            key={'multiline-tree-item-' + items[i].id }
            item={items[i]}
            raterBottom={raterBottom}
            orientation={orientation}
            x={coord.x+(x-150)}
            y={y-coord.y}
            scaler={scaler}
            onDragEnd={onDragEnd}
            isLeaf={true}
            />

            </g>
        )}
    </g> 
}