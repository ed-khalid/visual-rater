import React, { Component } from 'react'
import '../App.css' 
import * as d3  from 'd3'


class D3 extends Component {
    constructor(props) {
        super(props)
        this.draw = this.draw.bind(this) 
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
                .on("drag", this.dragged)
                .on("end", this.dragended));
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
          .style('fill','url(#linear-gradient)')
    }

    render() {
        return <div id="d3-wrapper" ref={node => this.node = node} width ={600} height={1000}></div>
    }

    dragstarted(d) {
          console.log('drag started')
          d3.select(this).raise().classed("active", true);
     }

    dragged(d) {
        console.log('dragging...')
        d3.select(this).select('rect').attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
        d3.select(this).select('text').attr("x", d.x = d3.event.x+5).attr("y", d.y = d3.event.y+20);
     }

     dragended(d) {
        console.log('drag end')
        d3.select(this).classed("active", false);
     } 

} 

export default D3 

