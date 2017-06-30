import React, { Component } from 'react'
import '../App.css' 
import Song from  '../models/song' 
import * as d3  from 'd3'


export default class Rater extends Component {
    constructor(props) {
        super(props)
    } 

    componentDidMount() {}


    render() {
      return <rect ref={rect => this.rect =rect} width="50" height="600" x="400" className="rater" fill="url(#linear-gradient)"></rect>
    }

    dragStart() {
          d3.select(this).raise().classed("active", true);
    }
     drag() {
          d3.select(this).select('line').attr('y1', d3.event.y).attr('y2', d3.event.y)
          d3.select(this).select('text').attr('y', d3.event.y)
     }
     dragEnd() {
       d3.select(this).classed('active', false)
     }
    postDragEnd(d) {
        //if (this.inRater(d)) this.addLine(d); 
    }
    informRater(d, type) {
        if (type == 'hover') {
            this.highlightRater(this.inRater(d)) 
        }
        else if (type =='dragend') {
          this.postDragEnd(d); 
        }
    }
    highlightRater(val) {
        d3.select('.rater').classed('active', val)
    }

     inRater(event) {
       return event.x >= 395 && event.x <= 445; 
     }

     addLine(d) {
       let g = this.rect.append('g')
          .call(d3.drag()
                .on("start", this.dragStart)
                .on("drag", this.drag)
                .on("end", this.dragEnd)
          )
       g.append('line')
        .attr('x1', 400)
        .attr('x2', 450)
        .attr('y1', d.y)
        .attr('y2', d.y)
        .attr('class', 'draggable')
        .attr('stroke','#ddd')
        .attr('stroke-width', '3px')
       g.append('text')
        .attr('x',  330 )
        .attr('y',  d.y)
        .attr('dy', '.35em')
        .text( d.songName )
        .style('fill', 'white')
     }

} 