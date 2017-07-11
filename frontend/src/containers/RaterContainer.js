import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { RaterSongActionCreator } from '../actions'
import Rater from '../components/Rater' 


class RaterContainer extends Component {
    constructor(props) {
        super(props)
        this.x=600
        this.y=80
        this.raterWidth=50
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
          this.props.updateScoreC(song)
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



