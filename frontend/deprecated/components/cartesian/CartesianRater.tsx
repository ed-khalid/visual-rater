import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale, Selection } from 'd3';
import { RatedItem } from "../../../models/CoreModels";
import { CartesianRaterSingleItem } from "./CartesianRaterItem";
import { ANIMATION_DURATION, CARTESIAN_RATER_Y_TOP, CartesianRaterItem, CartesianRaterState, Position } from '../../../../deprecated/models/CartesianRaterModels';
import { Dispatch, useEffect, useRef, useState, } from 'react';
import { ZoomBehavior } from './behaviors/ZoomBehavior';
import { Transition, TransitionGroup } from 'react-transition-group';
import { RaterAction } from '../../../../deprecated/reducers/raterReducer';
import { animateOnEnter, animateOnExit } from './CartesianRaterItemAnimation';
import './CartesianRater.css'

interface Props {
    position:Position
    state:CartesianRaterState
    isReadonly:boolean
    filterMode:boolean
    zoomTarget?:SVGGElement|null
    handleHover:(item:CartesianRaterItem, on:boolean) => void
    onItemClick:(item:RatedItem) => void
    onSongDrag:(itemId:string) => void 
    duringDrag:(itemId:string, score:number) => void
    stateDispatch:Dispatch<RaterAction>
    items: CartesianRaterItem[]
    updateSongScore: (id:string, score:number) => void 
}





export const CartesianRater = ({position, filterMode, handleHover, state, stateDispatch, onItemClick, duringDrag, onSongDrag, updateSongScore, isReadonly, items }:Props) => {

    const [currentItem, setCurrentItem] = useState<{id:string, score:number}|null>();  
    const g = useRef<SVGGElement>(null)
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

    const highlightItem = (itemNode:SVGGElement, toggleOn:boolean) => {
        items.map(it => it.nodeRef.current).filter( it => it !== itemNode).forEach( it => {
            select(it).classed('not-selected', toggleOn)
        })
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
                        <line className="rater-line" x1={position.x} y1={CARTESIAN_RATER_Y_TOP} x2={position.x} y2={position.y} />
                        <g className="items">
                       <TransitionGroup component={null} >
                      { items.map(item =>  
                        <Transition key={'single-rater-item'+item.name} onEnter={()=> animateOnEnter(item,position.x)} onExit={() => animateOnExit(item, position.x)}  nodeRef={item.nodeRef} timeout={ANIMATION_DURATION}>
                                <CartesianRaterSingleItem
                                    item={item}
                                    handleHover={handleHover}
                                    filterMode={filterMode}
                                    isReadonly={isReadonly}
                                    highlightOnDrag={highlightItem}
                                    nodeRef={item.nodeRef}
                                    mainlineX={position.x}
                                    scaler={state.scaler}
                                    onClick={onItemClick}
                                    duringDrag={duringDrag}
                                    onDragStart={onSongDrag}
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