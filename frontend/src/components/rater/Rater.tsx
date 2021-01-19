import React, { useState, SetStateAction, Dispatch, useEffect } from "react";
import './Rater.css';
import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { AxisScale, event as d3Event } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { brushY } from 'd3-brush'
import { Scaler } from "../../functions/scale";
import { useDeleteSongMutation, useUpdateSongMutation } from "../../generated/graphql";
import { ItemType } from "../../models/Item";
import { RatedItem } from "../../models/RatedItem";
import { SingleRaterItem } from "./SingleRaterItem";
import { MultiRaterItem } from "./MultiRaterItem";
import { AppConstants } from "../../App";

interface Props {
    highlight:boolean;
    ratedItems: RatedItem[];
    updateRatedItems:Dispatch<SetStateAction<RatedItem[]>>;
    setScaler:Dispatch<SetStateAction<Scaler>>;
    zoomReset:boolean
    scaler:Scaler;
    itemType:ItemType;
}



export const Rater:React.FunctionComponent<Props> = ({highlight, ratedItems, zoomReset, setScaler, updateRatedItems, scaler, itemType}) => {

    const position = AppConstants.rater.position 

    const [updateSong]  = useUpdateSongMutation();
    const [deleteSong] = useDeleteSongMutation()  
    const [currentItem, setCurrentItem] = useState<RatedItem|null>();  
    const [groupedItems, setGroupedItems] = useState<RatedItemGrouped[]>([]);

    useEffect(() => {
        if (zoomReset) {
          console.log('reset me bro')
          setScaler(new Scaler())
        }
    }, [zoomReset])

    useEffect(() => {
        groupCloseItems(ratedItems)
    }, [ratedItems, scaler])

    useEffect(() => {
        switch(itemType) {
            case ItemType.MUSIC :
            if (currentItem) {
                updateSong({variables: {song:  { id : currentItem.id, score: currentItem.score  } }})
                setCurrentItem(null)
           } 
        }
    }, [currentItem, itemType])

    const removeItem = (rItem: RatedItem) => {
        deleteSong({ variables : { songId:  rItem.id}})
        const _r  =  ratedItems.filter(_item => _item !== rItem);
        updateRatedItems([..._r])
    } 

    type RatedItemGrouped  = {
        id:string
        position:number
        ,items:RatedItem[]
    } 

    const groupCloseItems = (ratedItems:RatedItem[]) => {
         const groupedItems = ratedItems.reduce((acc:RatedItemGrouped[] , curr:RatedItem) => {
            const position =  scaler.toPosition(curr.score) 
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
            const sum  = it.items.reduce((curr,it) => curr + scaler.toPosition(it.score),0)
            const avg = sum/(it.items.length)
            it.position = avg
        })
        setGroupedItems(groupedItems)
    }  

    const updateItem =  (itemId:string, newScore:number) => {
        const item = ratedItems.find( it => it.id === itemId) 
        if (item) {
          item.score = newScore; 
          const _r = ratedItems.filter(_item => _item !== item);
          setCurrentItem(item);
          updateRatedItems( [..._r, item] )
        }
    }

    // const handleBrush = () => {
    //     const extent = d3Event.selection  
    //     // zoom out
    //     if (!extent) {
    //         setScaler(new Scaler())
    //     } else {
    //         const yScale = scaler.yScale
    //         yScale.domain([yScale.invert(extent[1]), yScale.invert(extent[0])])
    //         select<SVGGElement,any>('g.brush').call(brush.move, null)
    //         setScaler(new Scaler(yScale))
    //     }
    // }
    // const brush = brushY().extent([[100,0], [500,position.y]]).on('end', handleBrush)  
    // select<SVGGElement,any>('g.brush').call(brush)

    const zoomOnGroup=(position:number) => {
        const group = groupedItems.find(it => it.position === position)  
        if (group) {
            const min = group.items.reduce((curr,it) => Math.min(it.score,curr)  , Infinity)  
            const max = group.items.reduce((curr,it) => Math.max(it.score,curr)  , -Infinity)  
            const yScale = scaler.yScale  
            yScale.domain([min-0.05, max+0.05])
            setScaler(new Scaler(yScale))
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
    const axisSelection = makeAxis(scaler.scale) 
    const redraw = (args:any) => {
        const newScale = d3Event.transform.rescaleY(scaler.yScale)
        setScaler(new Scaler(newScale))
        axisSelection.call(axisRight(newScale))  
    } 
    const raterZoom = zoom<SVGGElement, unknown>()
    .scaleExtent([0,5])
    .translateExtent([[0, 0], [600, position.y]])
    .on('zoom', redraw)

    const addZoomListener = () => {
        select<SVGGElement, unknown>('rect#zoomListener')
        // .append('rect')
        // .attr('width', 600)
        // .attr('x', 30)
        // .attr('height', position.y)
        // .style('fill', 'none')
        // .style('pointer-events', 'all')
        .call(raterZoom)
    }
    addZoomListener()


    return (
                  <g id="raterContainer">
                      <rect id="zoomListener" width="600" x="30" height={position.y} fill="none" pointerEvents="all"></rect>
                      {/* <g x="150" width="300" className="brush"></g> */}
                      <g id="axis"></g>
                      <line id="rater" x1={position.x} y1={0} x2={position.x} y2={position.y} stroke={highlight? "#c234" :"#fff"}>
                      </line>
                      { groupedItems.map(rItemGrouped => 
                      (rItemGrouped.items.length === 1) ? 
                        <SingleRaterItem
                            key={rItemGrouped.items[0].id}
                            item={rItemGrouped.items[0]}
                            x={position.x}
                            y={rItemGrouped.position}
                            scaler={scaler}
                            onRemove={removeItem}
                            onDragEnd={updateItem}
                        />
                      :
                        <MultiRaterItem  
                            key={rItemGrouped.position}
                            items={rItemGrouped.items} 
                            id = {rItemGrouped.id}
                            zoomOnGroup={zoomOnGroup}
                            scaler={scaler}
                            onRemove={removeItem}
                            onDragEnd={updateItem}
                            x={position.x} 
                            y={rItemGrouped.position} 
                        />
                      )}
                  </g> 
    )
};  