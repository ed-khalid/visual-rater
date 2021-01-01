import React, { useState, SetStateAction, Dispatch, useEffect } from "react";
import './Rater.css';
import { drag } from 'd3-drag';
import { axisRight } from 'd3-axis'
import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { Position } from '../models/Position';
import { RatedItem } from "../models/RatedItem";
import { AxisScale, Selection, event as d3Event } from 'd3';
import { Scaler } from "../functions/scale";
import { Song, useDeleteSongMutation, useGetSongLazyQuery, useUpdateSongMutation } from "../generated/graphql";
import { ItemType } from "../models/Item";

interface Props {
    position:Position;
    highlight:boolean;
    ratedItems: RatedItem[];
    updateRatedItems:Dispatch<SetStateAction<RatedItem[]>>;
    setScaler:Dispatch<SetStateAction<Scaler>>;
    scaler:Scaler;
    itemType:ItemType;
}



export const Rater:React.FunctionComponent<Props> = ({position, highlight, ratedItems, setScaler, updateRatedItems, scaler, itemType}) => {

    const [g, updateG] = useState<SVGElement|null>(null);
    const [updateSong]  = useUpdateSongMutation();
    const [getFullSongInfo, { data }] = useGetSongLazyQuery(); 
    const [deleteSong] = useDeleteSongMutation()  
    const [currentItem, setCurrentItem] = useState<RatedItem|null>();  
    const raterWidth = 20; 

    useEffect(() => {
        if (g) {
            attachDragEvents()
            addZoomListener()
        }
    }, [g])

    useEffect(() => {
        if (data && currentItem && data.song && data.song.id === currentItem.id) {
            const song = currentItem as Song 
            song.artist = data.song.artist
            if (data.song.album) {
                song.album = {
                        id : data.song.album?.id
                        ,name:  data.song.album?.name
                }
            }
            setCurrentItem(Object.assign({},currentItem));
        }
    }, [data])
    useEffect(() => {
        switch(itemType) {
            case ItemType.MUSIC :
            const asSong = currentItem as Song; 
            if (currentItem) {
                // we are updating an existing song, get data and then call the update   
                if (currentItem.id && !asSong.artist) {
                    getFullSongInfo({ variables: { id: currentItem.id  }} )
                }
                // song info ready, plow ahead
                else {
                    updateSong({variables: {song:  { id : currentItem.id, score: currentItem.score  } }})
                    setCurrentItem(null)
                }
           } 
        }
    }, [currentItem, itemType])

    const isDragInBounds = (_y:number) => {
        return _y  >= 5  && _y <= position.y - 5; 
    }

    const dragStart = (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {

        const g = nodeList[i];
        const parentG = select<any,any>(g.parentNode);
        parentG.select('g.closeButton').classed('hide', true);
        select(g).classed('active', true);
    }   
    const dragInProgress = (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
          if (!isDragInBounds(d3Event.y)) {
              return;
          }
          const g = nodeList[i]; 
          select(g).selectAll('#itemSymbol').attr('cy', d3Event.y)
          select(g).selectAll('text').attr('y', d3Event.y)
          select(g).selectAll('text#score').text(scaler.toScore(d3Event.y).toFixed(2));
    }

    const dragEnd = (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
        const g = nodeList[i];
        const parentG = select<any,any>(g.parentNode);
        parentG.select('g.closeButton').classed('hide', false);
        const yPosition = Number(select(g).select('#itemSymbol').attr('cy'));        
        const score = scaler.toScore(yPosition);  
        const item = ratedItems[i];    
        item.score = score; 
        const _r = ratedItems.filter(_item => _item !== item);
        setCurrentItem(item);
        updateRatedItems( [..._r, item] )
        select(g).classed('active', false);
    }   

    const removeItem = (rItem: RatedItem) => {
        deleteSong({ variables : { songId:  rItem.id}})
        const _r  =  ratedItems.filter(_item => _item !== rItem);
        updateRatedItems([..._r])
    } 

    const attachDragEvents = () => {
        select(g).selectAll<SVGElement,any>('g.draggable').call(drag<SVGElement,any>()
            .on('start', dragStart)
            .on('drag', dragInProgress)
            .on('end', dragEnd)
          )
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
    const axisSelection:Selection<SVGSVGElement, any, HTMLElement, any> = makeAxis(scaler.scale) 

    const redraw = (args:any) => {
        const newScale = d3Event.transform.rescaleY(scaler.yScale)
        setScaler(Object.assign({}, scaler.rescale(newScale)))
        axisSelection.call(axisRight(newScale))  
    } 

    const raterZoom = zoom<SVGRectElement, unknown>()
                       .extent([[0, 0], [600, position.y]])
                       .on('zoom', redraw)

    const addZoomListener = () => {
        select(g).append('rect')
        .attr('width', 600)
        .attr('x', 30)
        .attr('height', position.y)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .call(raterZoom)
    }

    attachDragEvents()



    return (
                  <g id="raterContainer" ref= {node => updateG(node)}>
                      <g id="axis"></g>
                      <line id="rater" x1={position.x} y1={0} x2={position.x} y2={position.y} stroke={highlight? "#c234" :"#fff"}>
                      </line>
                      { ratedItems.map(rItem => <g key={rItem.name}>
                          <g className="item">
                          <g id="closeButton" onClick={() => removeItem(rItem)} className="closeButton" cursor="pointer" pointerEvents="stroke">
                              <line 
                                        x1={position.x-(raterWidth/2)-95} 
                                        y1={scaler.toPosition(rItem.score)-3}
                                        x2={position.x-(raterWidth/2)-90}
                                        y2={scaler.toPosition(rItem.score)+3}
                                        stroke="#ddd"
                              > 
                              </line>
                              <line 
                                        x1={position.x-(raterWidth/2)-90} 
                                        y1={scaler.toPosition(rItem.score)-3}
                                        x2={position.x-(raterWidth/2)-95}
                                        y2={scaler.toPosition(rItem.score)+3}
                                        stroke="#ddd"
                              > 
                            </line>
                          </g>
                          <g id="item" className="draggable"> 
                            <circle id="itemSymbol" cursor="move" cx={position.x} cy={scaler.toPosition(rItem.score)} r="5" fill="#ddd" fillOpacity="0.5"></circle>
                            <text id="score" cursor="move" fontSize="12" fontSizeAdjust="2" fill="white" x={position.x - 70} y={scaler.toPosition(rItem.score)} dy=".35em">{rItem.score.toFixed(2)}</text>
                            <text id="name" cursor="move" fontSize="12" fontSizeAdjust="2" fill="white" x={position.x + 70} y={scaler.toPosition(rItem.score)} dy=".35em">{rItem.name}</text>
                          </g>
                          </g>
                      </g>) }
                  </g> 
    )
};  