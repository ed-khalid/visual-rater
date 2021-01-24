import React, { useState, useEffect } from "react";
import './ReadOnlyRater.css';
import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale } from 'd3';
import { RatedItem } from "../../../models/RatedItem";
import { ReadOnlySingleRaterItem } from "./ReadOnlySingleRaterItem";
import { ReadOnlyMultiRaterItem } from "./ReadOnlyMultiRaterItem";
import { GlobalRaterState } from "../Rater";
import { Position } from "../../../models/Position";

interface Props {
    state:GlobalRaterState
    items:RatedItem[]
    position:Position
}



export const ReadOnlyRater:React.FunctionComponent<Props> = ({state, position, items}) => {

    const [groupedItems, setGroupedItems] = useState<RatedItemGrouped[]>([]);

    useEffect(() => {
        const groupCloseItems = (ratedItems:RatedItem[]) => {
            const groupedItems = ratedItems.reduce((acc:RatedItemGrouped[] , curr:RatedItem) => {
                const position =  state.scaler.toPosition(curr.score) 
                const overlap = acc.find((it:RatedItemGrouped) =>  Math.abs(Number(it.position) - position) < 15  )
                if (overlap) {
                    overlap.items.push(curr)
                } else {
                    acc.push({ position, items:[curr], id: '' + acc.length + 1 })
                }
                return acc
            },  [])
            // replace keys with average of groups   
            groupedItems.forEach(it => {
                const sum  = it.items.reduce((curr,it) => curr + state.scaler.toPosition(it.score),0)
                const avg = sum/(it.items.length)
                it.position = avg
            })
        setGroupedItems(groupedItems)
    }  

        groupCloseItems(items)
    }, [items, state.scaler])

    type RatedItemGrouped  = {
        id:string
        position:number
        ,items:RatedItem[]
    } 

    const makeAxis = (scale:AxisScale<number>) => {
        const _axis = axisRight(scale) 
        const axisSel = select<SVGSVGElement, any>('g#axis')
        .attr('transform', `translate(${position.x}, ${0})` )
        .call(_axis)
        axisSel.selectAll('line')
        .attr('x1', -6 )
        return axisSel
    }
    makeAxis(state.scaler.scale) 

    return (
                  <g id="raterContainer">
                      <g className="readonly-rater-axis"></g>
                      <line className="readonly-rater-line" x1={position.x} y1={0} x2={position.x} y2={position.y}>
                      </line>
                      { groupedItems.map(rItemGrouped => 
                      (rItemGrouped.items.length === 1) ? 
                        <ReadOnlySingleRaterItem
                            key={rItemGrouped.items[0].id}
                            item={rItemGrouped.items[0]}
                            x={position.x}
                            y={rItemGrouped.position}
                        />
                      :
                        <ReadOnlyMultiRaterItem  
                            key={rItemGrouped.position}
                            items={rItemGrouped.items} 
                            id = {rItemGrouped.id}
                            x={position.x} 
                            y={rItemGrouped.position} 
                        />
                      )}
                  </g> 
    )
};  