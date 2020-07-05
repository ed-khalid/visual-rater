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

    const isDragInBounds = function(_y:number) {
        return _y  >= 5  && _y <= 734; 
    }

    const dragStart = function(d:any, i:number, nodeList:ArrayLike<SVGElement> ) {
        const g = nodeList[i];
        select(g).classed('active', true);
    }   
    const dragInProgress = function(d:any, i:number, nodeList:ArrayLike<SVGElement> ) {
          if (!isDragInBounds(d3Event.y)) {
              return;
          }
          const g = nodeList[i]; 
          select(g).select('line').attr('y1', d3Event.y).attr('y2', d3Event.y)
          select(g).selectAll('text').attr('y', d3Event.y)
          select(g).selectAll('text#score').text(scaler.toScore(d3Event.y).toFixed(2));
    }
    const dragEnd = function(d:any, i:number, nodeList:ArrayLike<SVGElement> ) {
        const g = nodeList[i];
        console.log(g);
        const yPosition = Number(select(g).select('line').attr('y1'));        
        const score = scaler.toScore(yPosition);  
        const item = ratedItems[i];    
        item.score = score; 
        const _r = ratedItems.filter(_item => _item !== item);
        updateRatedItems( [..._r, item] )
        select(g).classed('active', false);
    }   


    const attachDragEvents = () => {
        select(g).selectAll<SVGElement,any>('g').call(drag<SVGElement,any>()
            .on('start', dragStart)
            .on('drag', dragInProgress)
            .on('end', dragEnd)
          )
    }
    attachDragEvents();

    return (
                  <g ref= {node => updateG(node)}>
                      <line x1={position.x} y1={0} x2={position.x} y2={position.y} stroke={highlight? "#c234" :"#fff"}>
                      </line>
                      { ratedItems.map(item => <g key={item.name}>
                          <line cursor="move" x1={position.x - raterWidth/2} x2={position.x + raterWidth/2} y1={scaler.toPosition(item.score)} y2={scaler.toPosition(item.score)} stroke="#ddd"></line>
                          <text cursor="move" fontSize="10" fontSizeAdjust="2" fill="white" x={position.x - 70} y={scaler.toPosition(item.score)} dy=".35em">{item.name}</text>
                          <text id="score" cursor="move" fontSize="10" fontSizeAdjust="2" fill="white" x={position.x + 70} y={scaler.toPosition(item.score)} dy=".35em">{item.score.toFixed(2)}</text>
                      </g>) }
                  </g> 
    )
};  