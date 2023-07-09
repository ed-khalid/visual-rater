import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale, Selection } from 'd3';
import { useUpdateSongMutation } from "../../generated/graphql";
import { ItemType, RatedItem } from "../../models/domain/ItemTypes";
import { RatedSongItemUI } from "../../models/ui/ItemTypes";
import { SingleRaterItem } from "./SingleRaterItem";
import { MultiRaterItem } from "./MultiRaterItem";
import { Position } from '../../models/ui/Position';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import React from 'react';
import './Rater.css'
import { GlobalRaterState, RaterOrientation } from '../../models/ui/RaterTypes';
import { ZoomBehavior } from './behaviors/ZoomBehavior';
import { MultiRaterItemGroup } from './MultiRaterItemGroup';

interface Props {
    position:Position
    state:GlobalRaterState
    zoomTarget?:SVGGElement|null
    setState:Dispatch<SetStateAction<GlobalRaterState>>
    items: RatedSongItemUI[];
    setItems:Dispatch<SetStateAction<RatedSongItemUI[]>>
}
export type RatedSongItemGrouped  = {
        id:string
        position:number
        ,items:RatedSongItemUI[]
    } 




export const Rater = ({position, state, setState, items, setItems }:Props) => {

    const [updateSong]  = useUpdateSongMutation();
    const [currentItem, setCurrentItem] = useState<RatedItem|null>();  
    const [groupedItems, setGroupedItems] = useState<RatedSongItemGrouped[]>([])
    const g = useRef<SVGGElement>(null)
    const zoomTarget= useRef<SVGGElement>(null)
    const zoomListener = useRef<SVGRectElement>(null)
    const [zoomBehavior, setZoomBehavior] = useState<any>() 


    useEffect(() => {
        if (zoomTarget) {
            const z = ZoomBehavior({listener: zoomListener.current, scale:state.scaler.yScale, setState  })
            setZoomBehavior(z)
        } 
    }, [zoomTarget, state.scaler.yScale, setState])

    useEffect(() => {
        const groupCloseItems = (ratedItems:RatedSongItemUI[]) => {
            const groupedItems = ratedItems.reduce((acc:RatedSongItemGrouped[] , curr:RatedSongItemUI) => {
                const position =  state.scaler.toPosition(curr.score) 
                const overlap = acc.find((it:RatedSongItemGrouped) =>  Math.abs(Number(it.position) - position) < 50  )
                if (overlap) {
                    overlap.items.push(curr)
                    overlap.items.sort((a,b) => (a.score > b.score) ? 1 : (a.score < b.score) ? -1 : 0 )
                    overlap.items.forEach((item, i) => item.tier = ((i+1) % 3) + 1)
                } else {
                    acc.push({ position, items:[curr], id: '' + acc.length + 1 })
                }
                return acc
            },  [])
            return groupedItems
        }  
        const leftItems = items.filter( it => it.orientation === RaterOrientation.LEFT)
        const rightItems = items.filter( it => it.orientation === RaterOrientation.RIGHT)
        const leftGroups =  groupCloseItems(leftItems)
        const rightGroups =  groupCloseItems(rightItems)
        setGroupedItems([...leftGroups, ...rightGroups])
    }, [items, state.scaler])

    useEffect(() => {
        switch(state.itemType) {
            case ItemType.MUSIC :
            if (currentItem) {
                updateSong({variables: {song:  { id : currentItem.id, score: currentItem.score  } }})
                setCurrentItem(null)
           } 
        }
    }, [currentItem, state.itemType, updateSong])


    const updateItem =  (itemId:string, newScore:number) => {
        console.log(newScore)
        const item = items.find( it => it.id === itemId) 
        if (item) {
          item.score = newScore; 
          const _r = items.filter(_item => _item !== item);
          setCurrentItem(item);
          setItems( [..._r, item] )
        }
    }

    const zoomOnGroup = (position:number) => {
        const group = groupedItems.find(it => it.position === position)  
        if (group) {
            const {start,end} = zoomBehavior?.zoomOnGroup(group)
            setState({...state, start, end})
        }
    } 

    const makeAxis = (scale:AxisScale<number>) => {
        const _axis = axisRight(scale) 
        const axisSel = select(g.current).select<SVGGElement>('g.rater-axis')
        .attr('transform', `translate(${position.x}, ${0})` )
        .call(_axis)
        // center axis lines instead of have them to the right 
        axisSel.selectAll('line')
        .attr('x1', -6 )
        return axisSel
    }
    const axisSel:Selection<SVGGElement, unknown, null, undefined> = makeAxis(state.scaler.scale) 

    return (
                  <g clipPath="url(#clip-path)"  ref={g} className="rater-container">
 {/* <rect 
                            ref={zoomListener} 
                            id="zoom-listener" 
                            x={position.x+5} 
                            height={position.y}
                            >
                        </rect> */}
                      <g ref={zoomTarget} className="zoom-target">
                        <g className="rater-axis"></g>
                        <line className="rater-line" x1={position.x} y1={0} x2={position.x} y2={position.y} />
                      {groupedItems.map(group =>  
                       (group.items.length === 1) ? 
                            <SingleRaterItem
                                key={group.items[0].id}
                                item={group.items[0]}
                                orientation={group.items[0].orientation}
                                mainlineX={position.x}
                                scaler={state.scaler}
                                onDragEnd={updateItem}
                            />:
                            <MultiRaterItemGroup
                                key={group.items[0].id}
                                id={group.items[0].id}
                                items={group.items}
                                orientation={group.items[0].orientation}
                                x={position.x}
                                y={group.position}
                                scaler={state.scaler}
                                zoomOnGroup={zoomOnGroup}
                            ></MultiRaterItemGroup>
                    //     <MultiRaterItem
                    //         key={"multi-rater-item-" + group.id}
                    //         group={group}
                    //         orientation={group.items[0].orientation}
                    //         mainlineX={position.x}
                    //         scaler={state.scaler}
                    //         onDragEnd={updateItem}
                    //   />
                      )}
                      
                      </g>
                    </g>
            )
    }