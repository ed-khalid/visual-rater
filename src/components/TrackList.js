import React, { Component } from 'react';

export default  class TrackList extends Component {

    render() {

        return <div style={{float:'left'}}>  
            <h3>Track List</h3>
            <ol> 
                {this.props.songs.map(it => <li key={it.title}>{it.title}({it.score}) </li>)}
            </ol> 
            </div>
    }

}