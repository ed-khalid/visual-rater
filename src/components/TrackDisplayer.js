import React, { Component } from 'react'
import '../App.css' 
import Song from  '../models/song' 
import * as d3  from 'd3'


export default class TrackDisplayer extends Component {

    constructor(props) {
        super(props)
        const mydudes =[]; 
        this.attachDragEvents = this.attachDragEvents.bind(this); 
    } 

    calculateY(index) {
        return 100 + (50*index) + (12*index); 
    }

    attachDragEvents() {
         
        d3.select(this.node).selectAll('g').call(d3.drag()
            .on('start', this.dragStart)
            .on('drag', this.drag)
            .on('end', this.dragEnd)
          )
    }

    componentDidMount() {
        this.attachDragEvents(); 
    }


    render() { return <g ref={node => this.node = node} >
       {this.props.songs.map( (it,i) => { 
            return <g key={it.title}>
                     <rect fill="red" className="draggable" width="60" height="50" x="60" y={this.calculateY(i)} ></rect>
                     <text fill="white" dy=".35em"  x="65" y={this.calculateY(i)+20}>{it.title + '(' + it.score + ')'}</text>
                   </g>
        })}
    </g>}

    dragStart() {
          d3.select(this).raise().classed("active", true);
     }

    drag() {
        d3.select(this).select('rect').attr("x", d3.event.x).attr("y", d3.event.y);
        d3.select(this).select('text').attr("x", d3.event.x+5).attr("y", d3.event.y+20);
     }

     dragEnd() {
        d3.select(this).classed("active", false);
     } 
} 


