import React, { useState } from "react";
import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import { RatedItem } from "../../models/RatedItem";
import { event as d3Event} from 'd3'
import { Scaler } from "../../functions/scale";

interface SingleRaterItemProps {
    item:RatedItem
    x:number
    y:number
    raterBottom:number
    onRemove:any
    onDragEnd:any
    scaler:Scaler
    scale?:number
} 

export const SingleRaterItem = ({item, x, y, scale=1, raterBottom, scaler, onRemove, onDragEnd}:SingleRaterItemProps) =>  {
    const [g,setG] = useState<SVGGElement|undefined>()
    const width = 20; 


    const isDragInBounds = (_y:number) => {
        return _y  >= 5  && _y <= raterBottom - 5; 
    }

    const dragStart = (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
        if (g) {
            select(g).select('g.close-button').classed('hide', true);
            select(g).classed('active', true);
        }
    }   
    const dragInProgress = (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
          if (!isDragInBounds(d3Event.y)) {
              return;
          }
          if (g) {
            select(g).selectAll('.item-symbol').attr('cy', d3Event.y)
            select(g).selectAll('text').attr('y', d3Event.y)
            select(g).selectAll('text.item-score').text(scaler.toScore(d3Event.y).toFixed(2));
          }
    }
    const dragEnd = (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
        if (g) {
          select(g).select('g.close-button').classed('hide', false);
          const yPosition = Number(select(g).select('.item-symbol').attr('cy'));        
          const score = scaler.toScore(yPosition);  
          onDragEnd(item.id, score)
          select(g).classed('active', false);
        }
    }   

    const formatName= (name:string) => {
        if (name.length <= 20 ) {
            return name
        }
        return name.slice(0,20) + '...'
    }

    const attachDrag = (g:SVGGElement|null) => {
        if (g) {
            select(g).call(drag<SVGGElement,any>()
                .on('start', dragStart)
                .on('drag', dragInProgress)
                .on('end', dragEnd))
            setG(g)
        }
    } 
      return <g ref={it => attachDrag(it)} className="item" key={item.name}>
                          <g className="close-button" onClick={() => onRemove(item)} cursor="pointer" pointerEvents="stroke">
                              <line 
                                        x1={x-(width/2)-220} 
                                        y1={y-3}
                                        x2={x-(width/2)-225}
                                        y2={y+3}
                                        stroke="#3d3d3d"
                              > 
                              </line>
                              <line 
                                        x1={x-(width/2)-225} 
                                        y1={y-3}
                                        x2={x-(width/2)-220}
                                        y2={y+3}
                                        stroke="#3d3d3d"
                              > 
                            </line>
                          </g>
                          <g id="item" className="draggable"> 
                            <circle className="item-symbol" cursor="move" cx={x} cy={y} r={5*scale} fill="#3d3d3d" fillOpacity="0.5"></circle>
                            <text className="item-score" cursor="move" fontSize={12*scale} fontSizeAdjust="2" fill="#3d3d3d" x={x - 210} y={y} dy=".35em">{item.score.toFixed(2)}</text>
                            <text className="item-name" cursor="move" fontSize={12*scale} fontSizeAdjust="2" fill="#3d3d3d" x={x - 170} y={y} dy=".35em">{formatName(item.name)}</text>
                          </g>
                      </g>
}