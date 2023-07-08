import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale, Selection } from 'd3';
import { Scaler } from "../../functions/scale";
import { useUpdateSongMutation } from "../../generated/graphql";
import { ItemType, RatedItem } from "../../models/domain/ItemTypes";
import { RatedSongItemUI } from "../../models/ui/ItemTypes";
import { SingleRaterItem } from "./SingleRaterItem";
import { MultiRaterItem } from "./MultiRaterItem";
import { Position } from '../../models/ui/Position';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import React from 'react';
import './Rater.css'
import { RATER_BOTTOM } from '../../App';
export interface RaterTreeInfo {
  top: number;
  bottom: number;
  items:Array<{ coord: {x:number,y:number}, item: RatedSongItemUI}>;
  mainline:Position
  center: { x:number, y:number} 
  stepSize: number
  radius:number
}

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

export type GlobalRaterState = {
    scaler:Scaler
    start:string
    end:string
    itemType:ItemType
}
export enum RaterOrientation {
    RIGHT, LEFT
}   



export const Rater = ({position, state, setState, items, setItems }:Props) => {

    const [updateSong]  = useUpdateSongMutation();
    const [currentItem, setCurrentItem] = useState<RatedItem|null>();  
    const [groupedItems, setGroupedItems] = useState<RatedSongItemGrouped[]>([])
    const g = useRef<SVGGElement>(null)
    // const zoomTarget= useRef<SVGGElement>(null)
    // const zoomListener = useRef<SVGRectElement>(null)
    // const [zoomBehavior, setZoomBehavior] = useState<any>() 


    useEffect(() => {
        const groupCloseItems = (ratedItems:RatedSongItemUI[]) => {
            const groupedItems = ratedItems.reduce((acc:RatedSongItemGrouped[] , curr:RatedSongItemUI) => {
                const position =  state.scaler.toPosition(curr.score) 
                const overlap = acc.find((it:RatedSongItemGrouped) =>  Math.abs(Number(it.position) - position) < 15  )
                if (overlap) {
                    overlap.items.push(curr)
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
                  <g clipPath="url(#clip-path)"  ref={g} className="rater-container">
                      <g className="zoom-target">
                        <g className="rater-axis"></g>
                        <line className="rater-line" x1={position.x} y1={0} x2={position.x} y2={position.y} />
                      {groupedItems.map(group =>  
                       (group.items.length === 1) ? 
                            <SingleRaterItem
                                key={group.items[0].id}
                                item={group.items[0]}
                                raterBottom={RATER_BOTTOM}
                                orientation={group.items[0].orientation}
                                mainlineX={position.x}
                                x={90}
                                y={state.scaler.toPosition(group.items[0].score)}
                                scaler={state.scaler}
                                isPartOfGroup={false}
                                onDragEnd={updateItem}
                            />:
                        <MultiRaterItem
                            key={"multi-rater-item-" + group.id}
                            group={group}
                            orientation={group.items[0].orientation}
                            mainlineX={position.x}
                            itemShiftX={90}
                            scaler={state.scaler}
                            onDragEnd={updateItem}
                      />)
                      }
                      
                      </g>
                    </g>
            )
    }