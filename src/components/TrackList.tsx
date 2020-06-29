import React, { Component } from 'react';
import Song from '../models/song';


interface TrackListProps
{
    songs:Song[];
}


export default  class TrackList extends Component<TrackListProps> {

    render() {

        return <div style={{float:'left'}}>  
            <h3>Track List</h3>
            <ol> 
                {this.props.songs?.map(it => <li key={it.title}>{it.title}({it.score}) </li>)}
            </ol> 
            </div>
    }

}