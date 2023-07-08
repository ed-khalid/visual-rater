import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale, Selection } from 'd3';
import { Scaler } from "../../functions/scale";
import { useUpdateSongMutation } from "../../generated/graphql";
import { ItemType } from "../../models/Item";
import { RatedItem, RatedSongItem } from "../../models/RatedItem";
import { SingleRaterItem } from "./SingleRaterItem";
import { MultiRaterItem } from "./MultiRaterItem";
import { Position } from '../../models/Position';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import './Rater.css'
import { RATER_BOTTOM } from '../../App';
export interface RaterTreeInfo {
  top: number;
  bottom: number;
  items:Array<{ coord: {x:number,y:number}, item: RatedSongItem}>;
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
    const [singleElements, setSingleElements] = useState<RatedSongItem[]>([])
    const [trees, setTrees] = useState<RaterTreeInfo[]>([])
    const g = useRef<SVGGElement>(null)
    // const zoomTarget= useRef<SVGGElement>(null)
    // const zoomListener = useRef<SVGRectElement>(null)
    // const [zoomBehavior, setZoomBehavior] = useState<any>() 



    const drawTrees =  useCallback((groupedItems:RatedSongItemGrouped[])  => {
        const trees:Array<RaterTreeInfo> = []
        if (groupedItems.length === 0) {
            return trees
        }
        // sort by position
        groupedItems.sort((a,b) => (a.position < b.position) ? -1 :(a.position > b.position) ? 1 : 0 ) 
        // sort by middle then one then down
        const index = Math.floor(groupedItems.length / 2)
        const graphSort:RatedSongItemGrouped[] = [groupedItems[index]]
        for (let i = 1 ; i <= groupedItems.length/2; i++) {
            if ((index+i) < groupedItems.length) {
              graphSort.push(groupedItems[index+i]) 
            }
            if ((index-i) > -1) {
              graphSort.push(groupedItems[index-i]) 
            }
        }

        const findNewCenter = (mainlineY:number, items:Array<{coord:Position, item:RatedSongItem}>, intersection: RaterTreeInfo) => {
            const intersectionHalfHeight = (intersection.bottom - intersection.top)/2      
            const newTreeTop = (mainlineY - items[0].coord.y)  
            const newTreeBottom = (mainlineY - items[items.length-1].coord.y)  
            const newTreeHalfHeight  = (newTreeBottom - newTreeTop)/2 
            const margin = 30
            let retv;  
            if (mainlineY >= intersection.center.y) {
                retv =  intersection.center.y+ intersectionHalfHeight + newTreeHalfHeight + margin
            } else {
                retv = intersection.center.y - intersectionHalfHeight - newTreeHalfHeight - margin
            }
            return retv
        } 

        const detectIntersection = (mainlineY:number, tree:RaterTreeInfo, items:Array<{coord:Position, item:RatedSongItem}>) => {
            const newTreeTop = (mainlineY - items[0].coord.y)  
            const newTreeBottom = (mainlineY - items[items.length-1].coord.y)  
            if ( tree.top <= newTreeTop && tree.bottom >= newTreeTop) return true 
            if ( tree.top <= newTreeBottom && tree.bottom >= newTreeBottom) return true
            return false
        }

        graphSort.forEach(group => {
           const orientation = group.items[0].orientation
           const anchor = (orientation === RaterOrientation.LEFT) ? (90 * (Math.PI/180)) : (-90 * (Math.PI/180)); 
           const circleDivisions = group.items.length + 1;   
           const step = Math.PI / circleDivisions   
           const radius = 60 + (group.items.length * 7) ; 
           const items = group.items.map((item, i) => {
                const cos = radius * Math.cos(anchor + ((i+1)*step) ) 
                const sin = radius * Math.sin(anchor + ((i+1)*step) ) 
                return { item, coord: { x: cos, y : sin} }
           })
           const intersection  = trees.find(it =>  detectIntersection(group.position, it, items))
           const center = intersection ? { x: (orientation === RaterOrientation.LEFT) ?position.x-100: position.x+100, y: findNewCenter(group.position, items, intersection)}  : { x: (orientation === RaterOrientation.LEFT)? position.x-100: position.x+100, y: group.position}  
            trees.push({
                top: center.y - items[0].coord.y ,
                bottom: center.y - items[items.length-1].coord.y,
                items,
                mainline: {x: position.x, y: group.position },
                center,
                stepSize: step,
                radius: radius 
            })
        })
        return trees
    }, [position.x])

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

            const singleElements = groupedItems.filter(it => it.items.length === 1).map(it => it.items[0])    
            const trees = drawTrees(groupedItems.filter(it => it.items.length > 1))
            return { singleElements, trees } 
        }  
        const leftItems = items.filter( it => it.orientation === RaterOrientation.LEFT)
        const rightItems = items.filter( it => it.orientation === RaterOrientation.RIGHT)
        const leftGroups =  groupCloseItems(leftItems)
        const rightGroups =  groupCloseItems(rightItems)
        setSingleElements([...leftGroups.singleElements, ...rightGroups.singleElements])
        setTrees([...leftGroups.trees, ...rightGroups.trees])
    }, [items, state.scaler, drawTrees])

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
                        <g className={mode === RaterMode.PRIMARY ? "rater-axis" : "rater-axis readonly" }></g>
                        <line className={mode === RaterMode.PRIMARY? "rater-line": 'rater-line readonly' } x1={position.x} y1={0} x2={position.x} y2={position.y} />
                      { singleElements.map(item => 
                            <SingleRaterItem
                                key={item.id}
                                item={item}
                                raterBottom={RATER_BOTTOM}
                                orientation={item.orientation}
                                x={position.x}
                                y={state.scaler.toPosition(item.score)}
                                scaler={state.scaler}
                                onDragEnd={updateItem}
                            />)
                      }
                      {trees.map(tree => <MultiRaterItem
                            key={"tree-" + tree.top}
                            tree={tree}
                            orientation={tree.items[0].item.orientation}
                            scaler={state.scaler}
                            onDragEnd={updateItem}
                      />)
                      }
                      </g>
                    </g>
            )
    }