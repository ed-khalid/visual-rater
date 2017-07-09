import React, { Component } from 'react'
import '../App.css' 
import * as d3  from 'd3'


export default class Rater extends Component {

    constructor(props) {
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
                  width="50" 
                  height="600" 
                  x="400" 
                  className={'rater' +( (isInBounds)? ' active':'')} 
                  fill="url(#linear-gradient)">
               </rect>
               {this.props.songs.map(song => {
                  return <g key={song.title}>
                       <line x1="400" x2="450" y1={song.y} y2={song.y} stroke="#ddd" strokeWidth="3px"></line> 
                       <text fill="white" x="330" y={song.y} dy=".35em">{song.title}</text> 
                   </g>
               }) }
             </g>

    }

    dragStart() {
        return function(d) { 
          d3.select(this).classed("active", true);
        }
    }
    drag() {
        return function (d)  {
          d3.select(this).select('line').attr('y1', d3.event.y).attr('y2', d3.event.y)
          d3.select(this).select('text').attr('y', d3.event.y)
        }
    }
    dragEnd() {
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
