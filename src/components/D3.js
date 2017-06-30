import React, { Component } from 'react'
import '../App.css' 
import Song from  '../models/song' 
import * as d3  from 'd3'


class D3 extends Component {
    constructor(props) {
        super(props)
        this.draw = this.draw.bind(this) 
        this.example = this.example.bind(this) 
        this.svg;
        this.state = {
            width: 500
            ,height: 1000
        }
    } 


    componentDidMount() {
        this.draw() 
    }
    componentDidUpdate() {
       this.draw() 
    }

    example() {}

    drawSongs() {
        const rectAttr = {width: 60, height: 50, x: 60, y:100}
        let songAttr = this.props.songs.map( (it,i) => { 
          let retv = { 
            songName: it.title 
            ,songScore: it.score
            ,width: rectAttr.width 
            ,height: rectAttr.height
            ,x:rectAttr.x  
            ,y:rectAttr.y+(rectAttr.height*i)+(12*i)
          }
          return retv
        })

        //rect
        const g = this.svg.selectAll('g').data(songAttr).enter().append('g')
          .call(d3.drag()
                .on("start", this.dragstarted)
                .on("end", this.dragended())
                .on("drag", this.dragged(this)))
          g.append('rect')     
           .attr('width',  d=>d.width)
           .attr('height', d=>d.height)
           .attr('y', d =>d.y )
           .attr('x', d=>d.x)
           .attr('class', 'draggable')
           .style('fill', 'red')
           g.append('text')
            .attr('x',  d=>d.x+5)
            .attr('y',  d=>d.y+20)
            .attr('dy', '.35em')
            .text( d => d.songName + '(' + d.songScore + ')' )
            .style('fill', 'white')
    }


    draw() {

        const node = this.node;
        const dataMax = d3.max(this.props.data) 
        const yScale = d3.scaleLinear().domain([0, dataMax]).range([0, this.props.size[1]])

        this.svg = d3.select(node).append('svg')
          .style('height', this.state.height +'px')
          .style('width', this.state.width +'px')

        this.drawSongs(); 


        //rater
        const defs = this.svg.append('defs')
        const linearGradient = defs.append('linearGradient')
          .attr('id','linear-gradient')
          .attr('x1','0%')
          .attr('x2','0%')
          .attr('y1','100%')
          .attr('y2','0%')
        linearGradient.append('stop')
          .attr('offset','0%')
          .attr('stop-color','black')
        linearGradient.append('stop')
          .attr('offset','25%')
          .attr('stop-color','#ff6666') //red
        linearGradient.append('stop')
          .attr('offset','60%')
          .attr('stop-color','#fed528') //yellow
        linearGradient.append('stop')
          .attr('offset','75%')
          .attr('stop-color','#64db76') //green
        linearGradient.append('stop')
          .attr('offset','95%')
          .attr('stop-color','#11541b') //dark green
        linearGradient.append('stop')
          .attr('offset','100%')
          .attr('stop-color','black') //dark green

        this.svg.append('rect')
          .attr('width',50)
          .attr('height',600)
          .attr('x', 400)
          .attr('class','rater')
          .style('fill','url(#linear-gradient)')
    }

    render() {
        return <div id="d3-wrapper" ref={node => this.node = node} width ={600} height={1000}></div>
    }

    dragstarted() {
          d3.select(this).raise().classed("active", true);
     }

    dragged() {
      let self = this;
      return function() { 
        d3.select(this).select('rect').attr("x", d3.event.x).attr("y", d3.event.y);
        d3.select(this).select('text').attr("x", d3.event.x+5).attr("y", d3.event.y+20);
        if (self.inRater(d3.event)) {
          console.log('hit')
          d3.select('.rater').classed('active', true)
        }
        else {
          d3.select('.rater').classed('active', false)
        }
      } 
     }

     dragended() {
       let self = this
       return function(d) {
        d3.select(this).classed("active", false);
        d3.select('.rater').classed('active', false)
        if (self.inRater(d)) self.addLine(d)
       }
     } 

     raterDragStart() {
          d3.select(this).raise().classed("active", true);
     }
     raterDragging() {
          d3.select(this).select('line').attr('y1', d3.event.y).attr('y2', d3.event.y)
          d3.select(this).select('text').attr('y', d3.event.y)
     }
     raterDragEnd() {
       d3.select(this).classed('active', false)
     }

     inRater(event) {
       return event.x >= 395 && event.x <= 445; 
     }

     addLine(d) {
       let g = this.svg.append('g')
          .call(d3.drag()
                .on("start", this.raterDragStart)
                .on("drag", this.raterDragging)
                .on("end", this.raterDragEnd)
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

export default D3 

