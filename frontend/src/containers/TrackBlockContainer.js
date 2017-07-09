import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { CurrentSongActionCreator, TrackLocationActionCreator } from '../actions'
import TrackBlock  from '../components/TrackBlock'


class TrackBlockContainer extends Component {

    render() { return <TrackBlock
                 songs={this.props.songs}
                 currentSong={this.props.currentSong}
                 trackLocation={this.props.trackLocation}
               > 
               </TrackBlock> 
    }
} 

function mapStateToProps(state) {
    return  {
        songs : state.tracklist
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ currentSong: CurrentSongActionCreator,   
        trackLocation: TrackLocationActionCreator},dispatch )
}

export default connect(mapStateToProps, mapDispatchToProps)(TrackBlockContainer)


