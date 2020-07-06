import React, { useState, SetStateAction, Dispatch } from "react";
import './Rater.css';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { Position } from '../models/Position';
import { RatedItem } from "../models/RatedItem";
import { event as d3Event } from 'd3';
import { Scaler } from "../functions/scale";

interface Props {
    position:Position;
    highlight:boolean;
    ratedItems: RatedItem[];
    updateRatedItems:Dispatch<SetStateAction<RatedItem[]>>;
    scaler:Scaler;
}

export const Rater:React.FunctionComponent<Props> = ({position, highlight, ratedItems, updateRatedItems, scaler}) => {

    const [g, updateG] = useState<SVGElement|null>(null);
    const raterWidth = 20; 

    const isDragInBounds = (_y:number) => {
        return _y  >= 5  && _y <= 734; 
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
          select(g).selectAll('line').attr('y1', d3Event.y).attr('y2', d3Event.y)
          select(g).selectAll('text').attr('y', d3Event.y)
          select(g).selectAll('text#score').text(scaler.toScore(d3Event.y).toFixed(2));
    }
    const dragEnd = (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
        const g = nodeList[i];
        const parentG = select<any,any>(g.parentNode);
        parentG.select('g.closeButton').classed('hide', false);
        const yPosition = Number(select(g).select('line').attr('y1'));        
        const score = scaler.toScore(yPosition);  
        const item = ratedItems[i];    
        item.score = score; 
        const _r = ratedItems.filter(_item => _item !== item);
        updateRatedItems( [..._r, item] )
        select(g).classed('active', false);
    }   


    const attachDragEvents = () => {
        select(g).selectAll<SVGElement,any>('g.draggable').call(drag<SVGElement,any>()
            .on('start', dragStart)
            .on('drag', dragInProgress)
            .on('end', dragEnd)
          )
    }
    attachDragEvents();

    return (
                  <g ref= {node => updateG(node)}>
                      <line id="rater" x1={position.x} y1={0} x2={position.x} y2={position.y} stroke={highlight? "#c234" :"#fff"}>
                      </line>
                      { ratedItems.map(rItem => <g key={rItem.item.name}>
                          <g className="item">
                          <g className="closeButton" cursor="pointer" pointerEvents="stroke">
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
                          <g className="draggable"> 
                            <line id="itemLine" cursor="move" x1={position.x - raterWidth/2} x2={position.x + raterWidth/2} y1={scaler.toPosition(rItem.score)} y2={scaler.toPosition(rItem.score)} stroke="#ddd"></line>
                            <text cursor="move" fontSize="10" fontSizeAdjust="2" fill="white" x={position.x - 70} y={scaler.toPosition(rItem.score)} dy=".35em">{rItem.item.name}</text>
                            <text id="score" cursor="move" fontSize="10" fontSizeAdjust="2" fill="white" x={position.x + 70} y={scaler.toPosition(rItem.score)} dy=".35em">{rItem.score.toFixed(2)}</text>
                          </g>


                          </g>
                      </g>) }
                  </g> 
    )
};  