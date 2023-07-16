import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale, Selection } from 'd3';
import { RatedItem } from "../../models/domain/ItemTypes";
import { SingleRaterItem } from "./SingleRaterItem";
import { MultiRaterItem } from "./MultiRaterItem";
import { Position } from '../../models/ui/Position';
import { Dispatch, useEffect, useRef, useState, } from 'react';
import React from 'react';
import './Rater.css'
import { RaterState, RATER_Y_TOP, RatedSongItemGrouped } from '../../models/ui/RaterTypes';
import { ZoomBehavior } from './behaviors/ZoomBehavior';
import { ANIMATION_DURATION } from '../../models/ui/Animation';
import { Transition, TransitionGroup } from 'react-transition-group';
import { RaterAction } from '../../reducers/raterReducer';

interface Props {
    position:Position
    state:RaterState
    isReadonly:boolean
    zoomTarget?:SVGGElement|null
    onItemClick:(item:RatedItem) => void
    stateDispatch:Dispatch<RaterAction>
    items: RatedSongItemGrouped[]
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

    const itemDefaultStyle = {
        opacity: 0,
        transition: `all ${ANIMATION_DURATION}ms ease-in-out`
    } 
    const itemTransitionStyles= {
        entering: { opacity: 0.2  },
        entered: { opacity: 1, transform: `translateX(${10}%)`  },
        exiting: { opacity: 0.2 },
        exited: { opacity: 0, transform: `translateX(${-10}%)` },
        unmounted: { opacity: 0}
    }

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
                      { items.map(group =>  
                       (group.items.length === 1) ? 
                        <Transition key={'item'+group.items[0].id} in={true} nodeRef={group.items[0].nodeRef} timeout={ANIMATION_DURATION}>
                            { transitionState => 
                                (<SingleRaterItem
                                    item={group.items[0]}
                                    isReadonly={isReadonly}
                                    style={{...itemDefaultStyle, ...itemTransitionStyles[transitionState] }}
                                    shouldDrawScoreline={true}
                                    orientation={group.items[0].orientation}
                                    mainlineX={position.x}
                                    scaler={state.scaler}
                                    onClick={onItemClick}
                                    onDragEnd={updateItem}
                                />)
                            }
                          </Transition>
                          :
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
                      }
                      </TransitionGroup>
                      </g>
                      
                      </g>
                    </g>
            )
    }