import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale, Selection } from 'd3';
import { Scaler } from "../../functions/scale";
import { GetArtistsDocument, useDeleteSongMutation, useUpdateSongMutation } from "../../generated/graphql";
import { ItemType } from "../../models/Item";
import { RatedItem } from "../../models/RatedItem";
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
    items: RatedItem[];
    setItems:Dispatch<SetStateAction<RatedItem[]>>
    mode:RaterMode
}
export type RatedItemGrouped  = {
        id:string
        position:number
        ,items:RatedItem[]
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
    const [deleteSong] = useDeleteSongMutation()  
    const [currentItem, setCurrentItem] = useState<RatedItem|null>();  
    const [groupedItems, setGroupedItems] = useState<RatedItemGrouped[]>([]);
    const g = useRef<SVGGElement>(null)
    const zoomTarget= useRef<SVGGElement>(null)
    const zoomListener = useRef<SVGRectElement>(null)
    const [zoomBehavior, setZoomBehavior] = useState<any>() 


    useEffect(() => {
        if (zoomTarget && zoomListener) {
            const z = ZoomBehavior({listener: zoomListener.current, target: zoomTarget.current,axis: axisSel ,scale:state.scaler.yScale, setState  })
            setZoomBehavior(z)
        } else if (mode === RaterMode.SECONDARY) {
            const z = ZoomBehavior()
            setZoomBehavior(z)
        } 
    }, [zoomListener,zoomTarget, mode])

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

    useEffect(() => {
        switch(state.itemType) {
            case ItemType.MUSIC :
            if (currentItem) {
                updateSong({variables: {song:  { id : currentItem.id, score: currentItem.score  } }})
                setCurrentItem(null)
           } 
        }
    }, [currentItem, state.itemType, updateSong])

    const removeItem = (rItem: RatedItem) => {
        deleteSong({ variables : { songId:  rItem.id}, refetchQueries:[{query:GetArtistsDocument}] })
        const _r  =  items.filter(_item => _item !== rItem);
        setItems([..._r])
    } 

    const zoomOnGroup = (position:number) => {
        const group = groupedItems.find(it => it.position === position)  
        if (group) {
            const {start,end} = zoomBehavior?.zoomOnGroup(group)
            setState({...state, start, end})
        }
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
                      {mode === RaterMode.PRIMARY && 
                        <rect 
                            ref={zoomListener} 
                            id="zoom-listener" 
                            x={position.x+5} 
                            height={position.y}
                            >
                        </rect>
                      }
                      {mode === RaterMode.PRIMARY && 
                        <rect 
                            id="pan-listener" 
                            x={position.x+70} 
                            height={position.y}
                            >
                        </rect>
                      }
                      <g ref={zoomTarget} className="zoom-target">
                        <g className={mode === RaterMode.PRIMARY ? "rater-axis" : "rater-axis readonly" }></g>
                        <line className={mode === RaterMode.PRIMARY? "rater-line": 'rater-line readonly' } x1={position.x} y1={0} x2={position.x} y2={position.y} />
                      { groupedItems.map(rItemGrouped => 
                      (rItemGrouped.items.length === 1) ? 
                        <SingleRaterItem
                            orientation={mode === RaterMode.PRIMARY? RaterOrientation.LEFT:RaterOrientation.RIGHT}
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
                            orientation={ mode === RaterMode.PRIMARY? RaterOrientation.LEFT:RaterOrientation.RIGHT}
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
                    </g>
                    )
                      }