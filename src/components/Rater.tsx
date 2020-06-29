import { Component } from 'react'
import * as d3  from 'd3'
import React from 'react';
import { BaseRaterProps } from '../containers/RaterContainer';

export interface RaterProps extends BaseRaterProps {
    raterWidth:number;
    inRater:Function;
    songs:any;
    songScale:any;
    height:number;
    x:number;
    y:number;
}

export default class Rater extends Component<RaterProps, {}> {

     node:any;

    constructor(props: RaterProps) {
        super(props)
        this.attachDragEvents = this.attachDragEvents.bind(this); 
    } 

    componentDidUpdate() {
      this.attachDragEvents(); 
    }

    render() {

      let isInBounds = this.props.inRater(this.props.trackLocationEvent); 

      return <g ref={node => this.node= node} >
               <rect 
                  width={this.props.raterWidth} 
                  height={this.props.height} 
                  x={this.props.x} 
                  y={this.props.y}
                  className={'rater' +( (isInBounds)? ' active':'')} 
                  fill="url(#linear-gradient)">
               </rect>
               {this.props.songs.map((song:any) => {
                  return <g key={song.title}>
                       <line x1={this.props.x} x2={this.props.x+this.props.raterWidth} y1={song.y} y2={song.y} stroke="#ddd" strokeWidth="3px"></line> 
                       <text fill="white" x={this.props.x-70}  y={song.y} dy=".35em">{song.title}</text> 
                   </g>
               }) }
             </g>

    }

    dragStart()  {
        return function(g:SVGElement, _this:any) { 
          d3.select(_this).classed("active", true);
        }
    }


    isDragInBounds(y:number) {
        return y  >= this.props.y && y <= this.props.y + this.props.height; 
    }

    drag() {
        let self = this
        return function (_:SVGElement, _this:any)  {
          if (!self.isDragInBounds(d3.event.y)) {
              return;
          }
          d3.select(_this).select('line').attr('y1', d3.event.y).attr('y2', d3.event.y)
          d3.select(_this).select('text').attr('y', d3.event.y)
          let songName = _this.textContent;  
          self.props.updateScoreC({title:songName, score:self.props.songScale(d3.event.y)})
        }
    }
    dragEnd() {
        return function(_:SVGElement, _this:any)  {
          d3.select(_this).classed('active', false)
        }
    }


    attachDragEvents() {
        d3.select(this.node).selectAll<SVGElement, any>('g').call(d3.drag<SVGElement, any>()
            .on('start', this.dragStart())
            .on('drag', this.drag())
            .on('end', this.dragEnd())
          );
    }

} 
