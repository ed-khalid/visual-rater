import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale, Selection } from 'd3';
import { Scaler } from "../../functions/scale";
import { GetArtistsDocument, useDeleteSongMutation, useUpdateSongMutation } from "../../generated/graphql";
import { ItemType } from "../../models/Item";
import { RatedItem, RatedSongItem } from "../../models/RatedItem";
import { SingleRaterItem } from "./SingleRaterItem";
import { MultiRaterItem } from "./MultiRaterItem";
import { Position } from '../../models/Position';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import React from 'react';
import './Rater.css'
import { ZoomBehavior } from './behaviors/ZoomBehavior';
import { RATER_BOTTOM } from '../../App';

interface Props {
    position:Position
    state:GlobalRaterState
    zoomTarget?:SVGGElement|null
    setState:Dispatch<SetStateAction<GlobalRaterState>>
    items: RatedSongItem[];
    setItems:Dispatch<SetStateAction<RatedSongItem[]>>
    mode:RaterMode
}
export type RatedSongItemGrouped  = {
        id:string
        position:number
        ,items:RatedSongItem[]
    } 

export type GlobalRaterState = {
    scaler:Scaler
    start:string
    end:string
    itemType:ItemType
}
export enum RaterMode {
    PRIMARY, SECONDARY
} 
export enum RaterOrientation {
    RIGHT, LEFT
}   



export const Rater = ({position, state, setState, items, setItems, mode}:Props) => {

    const [updateSong]  = useUpdateSongMutation();
    const [currentItem, setCurrentItem] = useState<RatedItem|null>();  
    const [groupedItems, setGroupedItems] = useState<RatedSongItemGrouped[]>([]);
    const g = useRef<SVGGElement>(null)
    // const zoomTarget= useRef<SVGGElement>(null)
    // const zoomListener = useRef<SVGRectElement>(null)
    // const [zoomBehavior, setZoomBehavior] = useState<any>() 

    useEffect(() => {
        const groupCloseItems = (ratedItems:RatedSongItem[]) => {
            const groupedItems = ratedItems.reduce((acc:RatedSongItemGrouped[] , curr:RatedSongItem) => {
                const position =  state.scaler.toPosition(curr.score) 
                const overlap = acc.find((it:RatedSongItemGrouped) =>  Math.abs(Number(it.position) - position) < 20  )
                if (overlap) {
                    overlap.items.push(curr)
                } else {
                    acc.push({ position, items:[curr], id: '' + acc.length + 1 })
                }
                return acc
            },  [])
            setGroupedItems(groupedItems)
        }  
        groupCloseItems(items)
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
                        <g className={mode === RaterMode.PRIMARY ? "rater-axis" : "rater-axis readonly" }></g>
                        <line className={mode === RaterMode.PRIMARY? "rater-line": 'rater-line readonly' } x1={position.x} y1={0} x2={position.x} y2={position.y} />
                      { groupedItems.map(rItemGrouped => 
                      (rItemGrouped.items.length === 1) ? 
                        <SingleRaterItem
                            key={rItemGrouped.items[0].id}
                            item={rItemGrouped.items[0]}
                            raterBottom={RATER_BOTTOM}
                            orientation={RaterOrientation.LEFT}
                            x={position.x}
                            y={rItemGrouped.position}
                            scaler={state.scaler}
                            onDragEnd={updateItem}
                        />
                      :
                        <MultiRaterItem  
                            key={rItemGrouped.position}
                            items={rItemGrouped.items} 
                            id = {rItemGrouped.id}
                            orientation={RaterOrientation.LEFT}
                            scaler={state.scaler}
                            onDragEnd={updateItem}
                            x={position.x} 
                            y={rItemGrouped.position} 
                        />)}
                      </g>
                    </g>
                    )
                      }