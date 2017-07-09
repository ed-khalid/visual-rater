import React, { Component } from 'react'
import '../App.css' 
import Song from  '../models/song' 
import * as d3  from 'd3'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { SongActionCreator } from '../actions'


class Rater extends Component {

    constructor(props) {
        super(props)
    } 

    componentDidUpdate() {
      let isInBounds = this.inRater(this.props.trackLocationEvent); 
      if (isInBounds && this.props.trackLocationEvent.type == 'end') {
          this.props.addSong(this.props.currentSong, this.props.trackLocationEvent.y)
          this.props.trackLocationEvent.type = undefined; 
      }
    }


    render() {

      let isInBounds = this.inRater(this.props.trackLocationEvent); 

      return <g>
               <rect ref={rect => this.rect =rect} 
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
          d3.select(this).classed("active", true);
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
       return event.x >= 340 && event.x <= 450; 
    }

    attachDragEvents() {
          d3.drag()
                .on("start", this.dragStart)
                .on("drag", this.drag)
                .on("end", this.dragEnd)
    }


} 

function mapStateToProps(state) {
    return {
        trackLocationEvent: state.trackLocation
        ,songs: state.raterSongs
        ,currentSong: state.currentSong 
    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({ 
         addSong :    SongActionCreator 
         ,songAdded : SongActionCreator
    
},dispatch) 
}

export default connect(mapStateToProps, mapDispatchToProps)(Rater)