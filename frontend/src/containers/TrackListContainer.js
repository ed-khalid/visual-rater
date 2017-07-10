import React, { Component } from 'react'
import { connect } from 'react-redux';
import TrackList  from '../components/TrackList'


class TrackListContainer extends Component {

    render() { return <TrackList
                 songs={this.props.songs}
               > 
               </TrackList> 
    }
} 

function mapStateToProps(state) {
    return  {
        songs : state.trackList
    }
}


export default connect(mapStateToProps)(TrackListContainer)