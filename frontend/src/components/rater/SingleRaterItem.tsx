import React, { useState } from "react";
import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import { RatedItem } from "../../models/RatedItem";
import { event as d3Event} from 'd3'
import { Scaler } from "../../functions/scale";
import { AppConstants } from "../../App";

interface SingleRaterItemProps {
    item:RatedItem
    x:number
    y:number
    onRemove:any
    onDragEnd:any
    scaler:Scaler
} 

export const SingleRaterItem = ({item, x, y, scaler, onRemove, onDragEnd}:SingleRaterItemProps) =>  {
    const raterBottom = AppConstants.rater.position.y 
    const [g,setG] = useState<SVGGElement|undefined>()
    const width = 20; 


    const isDragInBounds = (_y:number) => {
        return _y  >= 5  && _y <= raterBottom - 5; 
    }

    const dragStart = (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
        if (g) {
            select(g).select('g.closeButton').classed('hide', true);
            select(g).classed('active', true);
        }
    }   
    const dragInProgress = (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
          if (!isDragInBounds(d3Event.y)) {
              return;
          }
          if (g) {
            select(g).selectAll('#itemSymbol').attr('cy', d3Event.y)
            select(g).selectAll('text').attr('y', d3Event.y)
            select(g).selectAll('text#score').text(scaler.toScore(d3Event.y).toFixed(2));
          }
    }
    const dragEnd = (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
        if (g) {
          select(g).select('g.closeButton').classed('hide', false);
          const yPosition = Number(select(g).select('#itemSymbol').attr('cy'));        
          const score = scaler.toScore(yPosition);  
          onDragEnd(item.id, score)
          select(g).classed('active', false);
        }
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
                          <g id="closeButton" onClick={() => onRemove(item)} className="closeButton" cursor="pointer" pointerEvents="stroke">
                              <line 
                                        x1={x-(width/2)-95} 
                                        y1={y-3}
                                        x2={x-(width/2)-90}
                                        y2={y+3}
                                        stroke="#3d3d3d"
                              > 
                              </line>
                              <line 
                                        x1={x-(width/2)-90} 
                                        y1={y-3}
                                        x2={x-(width/2)-95}
                                        y2={y+3}
                                        stroke="#3d3d3d"
                              > 
                            </line>
                          </g>
                          <g id="item" className="draggable"> 
                            <circle id="itemSymbol" cursor="move" cx={x} cy={y} r="5" fill="#3d3d3d" fillOpacity="0.5"></circle>
                            <text id="score" cursor="move" fontSize="12" fontSizeAdjust="2" fill="#3d3d3d" x={x - 70} y={y} dy=".35em">{item.score.toFixed(2)}</text>
                            <text id="name" cursor="move" fontSize="12" fontSizeAdjust="2" fill="#3d3d3d" x={x + 70} y={y} dy=".35em">{item.name}</text>
                          </g>
                      </g>
}