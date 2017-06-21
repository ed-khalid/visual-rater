import React, { Component } from 'react'
import '../App.css' 
import * as d3  from 'd3'


class D3 extends Component {
    constructor(props) {
        super(props)
        this.draw = this.draw.bind(this) 
        this.example = this.example.bind(this) 
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

    draw() {

        const node = this.node;
        const dataMax = d3.max(this.props.data) 
        const yScale = d3.scaleLinear().domain([0, dataMax]).range([0, this.props.size[1]])

        const svg = d3.select(node).append('svg')
          .style('height', this.state.height +'px')
          .style('width', this.state.width +'px')

        const rects = [{width: 60, height: 50, x: 60, y:100}]

        //rect
        const g = svg.selectAll('g').data(rects).enter().append('g')
          .call(d3.drag()
                .on("start", this.dragstarted)
                .on("end", this.dragended())
                .on("drag", this.dragged(this)))
          g.append('rect')     
           .attr('width', d => d.width)
           .attr('height', d=> d.height)
           .attr('y', d=> d.y )
           .attr('x', d=> d.x)
           .attr('class', 'draggable')
           .style('fill', 'red')
           g.append('text')
            .attr('x',  d => d.x+5)
            .attr('y',  d => d.y+20)
            .attr('dy', '.35em')
            .text( d => 'Ahmed' )
            .style('fill', 'white')




        //rater
        const defs = svg.append('defs')
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

        svg.append('rect')
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
      return function(d) { 
        d3.select(this).select('rect').attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
        d3.select(this).select('text').attr("x", d.x = d3.event.x+5).attr("y", d.y = d3.event.y+20);
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
        if (self.inRater(d))
        console.log(`x: ${d.x}, y: ${d.y}`)
       }
     } 

     inRater(event) {
       return event.x >= 395 && event.x <= 445; 
     }

} 

export default D3 

