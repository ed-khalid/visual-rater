import React, { SetStateAction, Dispatch, useState } from "react";
import './Rater.css';
import * as d3 from 'd3';
import {  drag } from 'd3-drag';
import { Item } from "../models/Item";
import { Position } from '../models/Position';

interface Props {
    position:Position;
    highlight:boolean;
    ratedItems: Item[];
}

export const Rater:React.FunctionComponent<Props> = ({position, highlight, ratedItems}) => {

    const [g, updateG] = useState<SVGElement|null>(null);
    const height = 600;  
    const y = 0;  


    const dragStart = function(d:any) {
        d3.select(d).classed('active', true);
    }   
    const dragEnd = function(d:any) {
        d3.select(d).classed('active', true);
    }   
    const isDragInBounds = function(_y:number) {
        return _y  >= y && _y <= y + height; 
    }

    const dragInProgress = function(d:any) {
          if (!isDragInBounds(d3.event.y)) {
              return;
          }
          d3.select(d).select('line').attr('y1', d3.event.y).attr('y2', d3.event.y)
          d3.select(d).select('text').attr('y', d3.event.y)
    }

    const attachDragEvents = () => {
        d3.select(g).selectAll<SVGElement,any>('g').call(drag<SVGElement,any>()
            .on('start', dragStart)
            .on('drag', dragInProgress)
            .on('end', dragEnd)
          )
    }
    attachDragEvents();

    return (
                  <g ref= {node => updateG(node)}>
                      <line x1={position.x} y1={0} x2={position.x} y2={1000} stroke={highlight? "#c234" :"#fff"}>
                      </line>
                  </g> 
    )
};  