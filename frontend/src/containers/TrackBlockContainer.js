import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import { TrackBlockSongActionCreator, TrackLocationActionCreator } from '../actions'
import TrackBlock  from '../components/TrackBlock'


class TrackBlockContainer extends Component {

    render() { return <TrackBlock
                 songs={this.props.songs}
                 trackLocationC={this.props.trackLocationC}
                 currentlyDraggedSongC={this.props.currentlyDraggedSongC}
               > 
               </TrackBlock> 
    }

} 

function mapStateToProps(state) {
    return  {
        songs : state.trackBlocks
        ,currentlyDraggedSong: state.currentlyDraggedSong
        ,trackLocationEvent: state.trackLocation
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        { 
            trackLocationC: TrackLocationActionCreator
            ,currentlyDraggedSongC: TrackBlockSongActionCreator
        
    },dispatch )
}

export default connect(mapStateToProps, mapDispatchToProps)(TrackBlockContainer)


