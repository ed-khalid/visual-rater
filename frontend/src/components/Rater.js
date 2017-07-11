import React, { Component } from 'react'
import * as d3  from 'd3'


export default class Rater extends Component {

    constructor(props) {
        super(props)
        this.attachDragEvents = this.attachDragEvents.bind(this); 
        this.height = 600;
        let _scale  = d3.scaleLinear().domain([this.props.y, this.props.y+this.height]).range([10,0])
        this.songScale = (x) => _scale(x).toFixed(2)
    } 

    componentDidUpdate() {
      this.attachDragEvents(); 
    }

    render() {

      let isInBounds = this.props.inRater(this.props.trackLocationEvent); 

      return <g ref={node => this.node= node} >
               <rect 
                  width={this.props.raterWidth} 
                  height="600" 
                  x={this.props.x} 
                  y={this.props.y}
                  className={'rater' +( (isInBounds)? ' active':'')} 
                  fill="url(#linear-gradient)">
               </rect>
               {this.props.songs.map(song => {
                  return <g key={song.title}>
                       <line x1={this.props.x} x2={this.props.x+this.props.raterWidth} y1={song.y} y2={song.y} stroke="#ddd" strokeWidth="3px"></line> 
                       <text fill="white" x={this.props.x-70}  y={song.y} dy=".35em">{song.title}</text> 
                   </g>
               }) }
             </g>

    }

    dragStart() {
        return function(d) { 
          d3.select(this).classed("active", true);
        }
    }


    isDragInBounds(y) {
        return y  >= this.props.y && y <= this.props.y + this.height; 
    }

    drag() {
        let self = this
        return function (d)  {
          if (!self.isDragInBounds(d3.event.y)) {
              return;
          }
          d3.select(this).select('line').attr('y1', d3.event.y).attr('y2', d3.event.y)
          d3.select(this).select('text').attr('y', d3.event.y)
          let songName = this.textContent;  
          self.props.updateScoreC({title:songName, score:self.songScale(d3.event.y)})
        }
    }
    dragEnd() {
        let self = this
        return function(d)  {
          d3.select(this).classed('active', false)
        }
    }


    attachDragEvents() {
        d3.select(this.node).selectAll('g').call(d3.drag()
            .on('start', this.dragStart())
            .on('drag', this.drag())
            .on('end', this.dragEnd())
          )
    }


} 
