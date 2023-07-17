import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale, Selection } from 'd3';
import { RatedItem } from "../../models/domain/ItemTypes";
import { SingleRaterItem } from "./SingleRaterItem";
import { Position } from '../../models/ui/Position';
import { Dispatch, useEffect, useRef, useState, } from 'react';
import React from 'react';
import './Rater.css'
import { RaterState, RATER_Y_TOP, RatedSongItemGrouped } from '../../models/ui/RaterTypes';
import { ZoomBehavior } from './behaviors/ZoomBehavior';
import { ANIMATION_DURATION } from '../../models/ui/Animation';
import { Transition, TransitionGroup } from 'react-transition-group';
import { RaterAction } from '../../reducers/raterReducer';
import { RatedMusicItemUI } from '../../models/ui/ItemTypes';
import { animateOnEnter, animateOnExit } from './ItemAnimation';

interface Props {
    position:Position
    state:RaterState
    isReadonly:boolean
    zoomTarget?:SVGGElement|null
    onItemClick:(item:RatedItem) => void
    stateDispatch:Dispatch<RaterAction>
    items: RatedMusicItemUI[]
    updateSongScore: (id:string, score:number) => void 
}





export const Rater = ({position, state, stateDispatch, onItemClick, updateSongScore, isReadonly, items }:Props) => {

    const [currentItem, setCurrentItem] = useState<{id:string, score:number}|null>();  
    const g = useRef<SVGGElement>(null)
    const itemsGroupRef = useRef<SVGGElement>(null)
    const zoomTarget= useRef<SVGGElement>(null)
    const zoomListener = useRef<SVGRectElement>(null)
    // const [shouldHide, setShouldHide] = useState<boolean>(false)
    const [, setZoomBehavior] = useState<any>() 

    useEffect(() => {
        if (zoomTarget && zoomListener) {
            const z = ZoomBehavior({listener: zoomListener.current, target: zoomTarget.current,axis: axisSel ,scale:state.scaler.yScale, stateDispatch  })
            setZoomBehavior(z)
        } 
    }, [zoomListener,zoomTarget])


    useEffect(() => {
            if (currentItem) {
                updateSongScore(currentItem.id, currentItem.score)
                setCurrentItem(null)
        }
    }, [currentItem, updateSongScore])


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
                       <TransitionGroup component={null} >
                      { items.map(item =>  
                        <Transition key={'item'+item.id} onEnter={()=> animateOnEnter(item,position.x)} onExit={() => animateOnExit(item, position.x)}  nodeRef={item.nodeRef} timeout={ANIMATION_DURATION}>
                                <SingleRaterItem
                                    item={item}
                                    isReadonly={isReadonly}
                                    nodeRef={item.nodeRef}
                                    mainlineX={position.x}
                                    scaler={state.scaler}
                                    onClick={onItemClick}
                                    onDragEnd={updateItem}
                                />
                          </Transition>
                      )}
                      </TransitionGroup>
                      </g>
                      
                      </g>
                    </g>
            )
    }