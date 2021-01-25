import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale } from 'd3';
import { Scaler } from "../../functions/scale";
import { useDeleteSongMutation, useUpdateSongMutation } from "../../generated/graphql";
import { ItemType } from "../../models/Item";
import { RatedItem } from "../../models/RatedItem";
import { SingleRaterItem } from "./SingleRaterItem";
import { MultiRaterItem } from "./MultiRaterItem";
import { Position } from '../../models/Position';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import React from 'react';
import { RATER_BOTTOM } from '../../App';
import './Rater.css'

interface Props {
    position:Position
    state:GlobalRaterState
    setState:Dispatch<SetStateAction<GlobalRaterState>>
    items: RatedItem[];
    setItems:Dispatch<SetStateAction<RatedItem[]>>
}

export type GlobalRaterState = {
    scaler:Scaler
    start:string
    end:string
    itemType:ItemType
}



export const Rater:React.FunctionComponent<Props> = ({position, state, setState, items, setItems}:Props) => {

    const [updateSong]  = useUpdateSongMutation();
    const [deleteSong] = useDeleteSongMutation()  
    const [currentItem, setCurrentItem] = useState<RatedItem|null>();  
    const [groupedItems, setGroupedItems] = useState<RatedItemGrouped[]>([]);


    useEffect(() => {
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
    }, [currentItem, state.itemType])

    const removeItem = (rItem: RatedItem) => {
        deleteSong({ variables : { songId:  rItem.id}})
        const _r  =  items.filter(_item => _item !== rItem);
        setItems([..._r])
    } 

    type RatedItemGrouped  = {
        id:string
        position:number
        ,items:RatedItem[]
    } 

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

    const updateItem =  (itemId:string, newScore:number) => {
        const item = items.find( it => it.id === itemId) 
        if (item) {
          item.score = newScore; 
          const _r = items.filter(_item => _item !== item);
          setCurrentItem(item);
          setItems( [..._r, item] )
        }
    }

    const zoomOnGroup=(position:number) => {
        const group = groupedItems.find(it => it.position === position)  
        if (group) {
            const min = group.items.reduce((curr,it) => Math.min(it.score,curr)  , Infinity)  
            const max = group.items.reduce((curr,it) => Math.max(it.score,curr)  , -Infinity)  
            const yScale = state.scaler.yScale  
            yScale.domain([min-0.05, max+0.05])
            setState({...state, start: min-0.05+'', end:max+0.05+'' })
        }
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
                      <rect id="zoomListener" width="600" x="30" height={position.y} fill="none" pointerEvents="all"></rect>
                      <g className="rater-axis"></g>
                      <line className="rater-line" x1={position.x} y1={0} x2={position.x} y2={position.y}>
                      </line>
                      { groupedItems.map(rItemGrouped => 
                      (rItemGrouped.items.length === 1) ? 
                        <SingleRaterItem
                            key={rItemGrouped.items[0].id}
                            item={rItemGrouped.items[0]}
                            raterBottom={RATER_BOTTOM}
                            x={position.x}
                            y={rItemGrouped.position}
                            scaler={state.scaler}
                            onRemove={removeItem}
                            onDragEnd={updateItem}
                        />
                      :
                        <MultiRaterItem  
                            key={rItemGrouped.position}
                            items={rItemGrouped.items} 
                            id = {rItemGrouped.id}
                            zoomOnGroup={zoomOnGroup}
                            scaler={state.scaler}
                            onRemove={removeItem}
                            onDragEnd={updateItem}
                            x={position.x} 
                            y={rItemGrouped.position} 
                        />)}
                    </g>
                    )
                      }