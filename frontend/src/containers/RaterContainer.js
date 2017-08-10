import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { RaterSongActionCreator } from '../actions'
import Rater from '../components/Rater' 
import * as d3  from 'd3'


class RaterContainer extends Component {
    constructor(props) {
        super(props)
        this.x=600
        this.y=80
        this.raterWidth=50
        this.height = 600;
        let _scale  = d3.scaleLinear().domain([this.y, this.y+this.height]).range([10,0])
        this.songScale = (x) => _scale(x).toFixed(2)
    }

    render() {
        return <Rater 
                     trackLocationEvent={this.props.trackLocationEvent}   
                     songs={this.props.songs}
                     currentlyDraggedSong={this.props.currentlyDraggedSong}
                     updateScoreC={this.props.updateScoreC}
                     inRater= {this.inRater}
                     x={this.x}
                     y={this.y}
                     height={this.height}
                     songScale={this.songScale}
                     raterWidth={this.raterWidth}
                >
                </Rater>
    } 

    componentDidUpdate() {
      let isInBounds = this.inRater(this.props.trackLocationEvent); 
      if (isInBounds && this.props.trackLocationEvent.type === 'end') {
          let song = this.props.currentlyDraggedSong
          song.score = this.props.trackLocationEvent.y 
          this.props.addSongC(song); 
          this.props.updateScoreC({title:song.title,score:this.songScale(song.score)})
          this.props.trackLocationEvent.type = null; 
      }
    }

    inRater(event) {
       if (!event) return false;
       return event.x >= this.x && event.x <= this.x+this.raterWidth; 
    }
} 

function mapStateToProps(state) {
    return {
        trackLocationEvent: state.trackLocation
        ,songs: state.raterSongs
        ,currentlyDraggedSong: state.currentlyDraggedSong 
    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({ 
         addSongC :    RaterSongActionCreator 
         ,updateScoreC : function(song) { return RaterSongActionCreator(song, true) }  
    
},dispatch) 
}

export default connect(mapStateToProps, mapDispatchToProps)(RaterContainer)



