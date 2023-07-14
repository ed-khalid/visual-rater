import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale, Selection } from 'd3';
import { useUpdateSongMutation } from "../../generated/graphql";
import { ItemType, RatedItem } from "../../models/domain/ItemTypes";
import { RatedMusicItemUI } from "../../models/ui/ItemTypes";
import { SingleRaterItem } from "./SingleRaterItem";
import { MultiRaterItem } from "./MultiRaterItem";
import { Position } from '../../models/ui/Position';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import React from 'react';
import './Rater.css'
import { GlobalRaterState, RATER_Y_TOP, RatedSongItemGrouped } from '../../models/ui/RaterTypes';
import { ZoomBehavior } from './behaviors/ZoomBehavior';

interface Props {
    position:Position
    state:GlobalRaterState
    isReadonly:boolean
    zoomTarget?:SVGGElement|null
    onItemClick?:(item:RatedItem) => void
    setState:Dispatch<SetStateAction<GlobalRaterState>>
    items: RatedSongItemGrouped[]
    updateSongScore: (id:string, score:number) => void 
}





export const Rater = ({position, state, setState, onItemClick, updateSongScore, isReadonly, items }:Props) => {

    const [currentItem, setCurrentItem] = useState<{id:string, score:number}|null>();  
    const g = useRef<SVGGElement>(null)
    const itemsGroupRef = useRef<SVGGElement>(null)
    const zoomTarget= useRef<SVGGElement>(null)
    const zoomListener = useRef<SVGRectElement>(null)
    const [zoomBehavior, setZoomBehavior] = useState<any>() 


    useEffect(() => {
        if (zoomTarget && zoomListener) {
            const z = ZoomBehavior({listener: zoomListener.current, target: zoomTarget.current,axis: axisSel ,scale:state.scaler.yScale, setState  })
            setZoomBehavior(z)
        } 
    }, [zoomListener,zoomTarget])


    useEffect(() => {
        switch(state.itemType) {
            case ItemType.MUSIC :
            if (currentItem) {
                updateSongScore(currentItem.id, currentItem.score)
                setCurrentItem(null)
           } 
        }
    }, [currentItem, state.itemType])


    const updateItem =  (itemId:string, newScore:number) => {
        setCurrentItem({id:itemId, score:newScore})
    }

    const makeAxis = (scale:AxisScale<number>) => {
        const _axis = axisRight(scale) 
        const axisSel = select(g.current).select<SVGGElement>('g.rater-axis')
        .attr('transform', `translate(${position.x}, ${0})` )
        .call(_axis)
        axisSel.selectAll('line')
        .attr('x1', -6 )
        return axisSel
    }
    const axisSel:Selection<SVGGElement, unknown, null, undefined> = makeAxis(state.scaler.scale) 

    return (
                  <g ref={g} className="rater-container">
 <rect 
                            ref={zoomListener} 
                            id="zoom-listener" 
                            x={position.x+5} 
                            height={position.y}
                            >
                        </rect>
                      <g ref={zoomTarget} className="zoom-target">
                        <g className="rater-axis"></g>
                        <line className="rater-line" x1={position.x} y1={RATER_Y_TOP} x2={position.x} y2={position.y} />
                        <g ref={itemsGroupRef} className="items">
                      {items.map(group =>  
                       (group.items.length === 1) ? 
                            <SingleRaterItem
                                key={group.items[0].id}
                                item={group.items[0]}
                                isReadonly={isReadonly}
                                shouldDrawScoreline={true}
                                orientation={group.items[0].orientation}
                                mainlineX={position.x}
                                scaler={state.scaler}
                                onClick={onItemClick}
                                onDragEnd={updateItem}
                            />:  
                        <MultiRaterItem
                            key={"multi-rater-item-" + group.items[0].id}
                            group={group}
                            isReadonly={isReadonly}
                            orientation={group.items[0].orientation}
                            onClick={onItemClick}
                            mainlineX={position.x}
                            scaler={state.scaler}
                            onDragEnd={updateItem}
                      />)
                      }</g>
                      
                      </g>
                    </g>
            )
    }