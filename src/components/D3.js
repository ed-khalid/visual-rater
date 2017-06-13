import React, { Component } from 'react'
import '../App.css' 
import { scaleLinear } from 'd3-scale'
import { max } from 'd3-array'
import { select } from 'd3-selection'

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
        const dataMax = max(this.props.data) 
        const yScale = scaleLinear().domain([0, dataMax]).range([0, this.props.size[1]])

        const svg = select(node).append('svg')
          .style('height', this.state.height +'px')
          .style('width', this.state.width +'px')

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
          .style('fill','url(#linear-gradient)')
    }

    render() {
        return <div id="d3-wrapper" ref={node => this.node = node} width ={600} height={1000}></div>
    }

} 

export default D3 

