import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale } from 'd3';
import { Scaler } from "../../functions/scale";
import { GetArtistsDocument, useDeleteSongMutation, useUpdateSongMutation } from "../../generated/graphql";
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
    mode:RaterMode
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



export const Rater:React.FunctionComponent<Props> = ({position, state, setState, items, setItems, mode}:Props) => {

    const [updateSong]  = useUpdateSongMutation();
    const [deleteSong] = useDeleteSongMutation()  
    const [currentItem, setCurrentItem] = useState<RatedItem|null>();  
    const [groupedItems, setGroupedItems] = useState<RatedItemGrouped[]>([]);
    const [g, setG] = useState<SVGGElement>()
    const [panPoint,setPanPoint] = useState<{x:number,y:number}>()


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

    type RatedItemGrouped  = {
        id:string
        position:number
        ,items:RatedItem[]
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

    const zoomIn = (e:MouseEvent) => {
        const y = e.offsetY;  
        const score = state.scaler.toScore(y) 
        const min = Math.min((score - 0.25) || 0) 
        const max = Math.min((score + 0.25) || 5) 
        setState({...state, start: min.toFixed(2), end: max.toFixed(2) })
    }

    const makeAxis = (scale:AxisScale<number>) => {
        const _axis = axisRight(scale) 
        if (g) {
          const axisSel = select(g).select<SVGSVGElement>('g.rater-axis')
            .attr('transform', `translate(${position.x}, ${0})` )
            .call(_axis)
            axisSel.selectAll('line')
            .attr('x1', -6 )
            return axisSel
        }
    }
    makeAxis(state.scaler.scale) 
    const startPan = (e:MouseEvent) => {
        setPanPoint({x:e.offsetX, y:e.offsetY})
        console.log('pan start',{x:e.x, y:e.y})
    }
    const duringPan = (e:MouseEvent) => {
        if (panPoint) {
            const point:Position = { x: e.offsetX, y:e.offsetY}  
            const original = state.scaler.toScore(panPoint.y)  
            const delta = state.scaler.toScore(point.y) - original  
            // console.log('delta', delta)
            // console.log('start', state.start, 'end', state.end)
            const min = Math.max(Number(state.start) + delta, 0)     
            const max = Math.min(Number(state.end) + delta, 5)  
            console.log('start2', min.toFixed(2), 'end2', max.toFixed(2))
            setState({...state, start: min.toFixed(2), end:max.toFixed(2) })
            // console.log('pan move',point)
        }
    }  
    const endPan = (e:MouseEvent) => {
        const point:Position = {x:e.offsetX, y:e.offsetY}
        console.log('pan end', point)
        if (point.x === panPoint?.x && point.y === panPoint?.y) {
            zoomIn(e)
            setPanPoint(undefined)
        } else {
            setPanPoint(undefined)
        }
    }

    return (
                  <g  ref={it=> it ? setG(it):null} className="rater-container">
                      {mode === RaterMode.PRIMARY && <rect id="zoom-listener" onMouseUp={(e) => endPan(e.nativeEvent) } onMouseDown={(e) => startPan(e.nativeEvent)} onMouseMove={(e) => duringPan(e.nativeEvent) } x={position.x+5} height={position.y}></rect>}
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
                    )
                      }