import React, { Component } from 'react'
import * as d3  from 'd3'


export default class TrackBlock extends Component {

    constructor(props) {
        super(props)
        this.attachDragEvents = this.attachDragEvents.bind(this); 
    } 

    componentDidMount() {
        this.attachDragEvents(); 
    }

    calculateY(index) {
        return 100 + (50*index) + (12*index); 
    }

    attachDragEvents() {
         
        d3.select(this.node).selectAll('g').call(d3.drag()
            .on('start', this.dragStart())
            .on('drag', this.drag())
            .on('end', this.dragEnd())
          )
    }

    render() { return <g ref={node => this.node = node} >
       {this.props.songs.map( (it,i) => { 
            return <g id={i} key={'track'+it.title}>
                     <rect fill="red" className="draggable" width="60" height="50" x="60" y={this.calculateY(i)} ></rect>
                     <text fill="white" dy=".35em"  x="65" y={this.calculateY(i)+20}>{it.title}</text>
                   </g>
        })}
    </g>}

    dragStart() {
        let self = this
        return function(d) {
          d3.select(this).raise().classed("active", true);
          let index = parseInt(d3.select(this).attr('id'),10)
          self.props.currentSong(self.props.songs[index])
        }
     }

    drag() {
        let self = this;
        return function(d) {
            d3.select(this).select('rect').attr("x", d3.event.x).attr("y", d3.event.y);
            d3.select(this).select('text').attr("x", d3.event.x+5).attr("y", d3.event.y+20);
            self.props.trackLocation(d3.event)
        }
     }

     dragEnd() {
        let self = this; 
        return function(d) { 
          d3.select(this).classed("active", false);
          self.props.trackLocation(d3.event)
        }
     } 
} 





