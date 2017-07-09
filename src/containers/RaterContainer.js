import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { SongActionCreator } from '../actions'
import Rater from '../components/Rater' 


class RaterContainer extends Component {
    render() {
        return <Rater 
                     trackLocationEvent={this.props.trackLocationEvent}   
                     songs={this.props.songs}
                     newSong={this.props.newSong}
                     updateScore={this.props.updateScore}
                     inRater= {this.inRater}
                >
                </Rater>
    } 

    componentDidUpdate() {
      let isInBounds = this.inRater(this.props.trackLocationEvent); 
      if (isInBounds && this.props.trackLocationEvent.type === 'end') {
          this.props.addSong(this.props.newSong, this.props.trackLocationEvent.y)
          this.props.trackLocationEvent.type = undefined; 
      }
    }

    inRater(event) {
       return event.x >= 340 && event.x <= 450; 
    }
} 

function mapStateToProps(state) {
    return {
        trackLocationEvent: state.trackLocation
        ,songs: state.raterSongs
        ,newSong: state.newSong 
        ,currentSong: state.currentSong
    }
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({ 
         addSong :    SongActionCreator 
         ,updateScore : SongActionCreator 
    
},dispatch) 
}

export default connect(mapStateToProps, mapDispatchToProps)(RaterContainer)



