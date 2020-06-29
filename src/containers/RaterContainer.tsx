import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { RaterSongActionCreator } from '../actions'
import Rater from '../components/Rater' 
import * as d3  from 'd3'

export interface BaseRaterProps {
    trackLocationEvent:{x:number, y:number, type:string|null};
    currentlyDraggedSong:any|null;
    updateScoreC:any|null;
} 

export interface RaterContainerProps extends BaseRaterProps {
    songs:any;
    songScale:any;
    addSongC:Function;
    x:number;
    y:number;
}


class RaterContainer extends Component<RaterContainerProps>  {

    constructor(props: Readonly<RaterContainerProps>) {
        super(props)
        this.x=600
        this.y=80
        this.raterWidth=50
        this.height = 600;
    }

    private x:number; 
    private y:number;
    private raterWidth:number;
    private height:number;

    private _scale = d3.scaleLinear().domain([this.y, this.y+this.height]).range([10,0])

    private songScale(x: number | { valueOf(): number }):string {
        return this._scale(x).toFixed(2); 
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

    inRater(event: {x:number} ) {
       if (!event) return false;
       return event.x >= this.x && event.x <= this.x+this.raterWidth; 
    }
} 

function mapStateToProps(state: { trackLocation: any; raterSongs: any; currentlyDraggedSong: any }) {
    return {
        trackLocationEvent: state.trackLocation
        ,songs: state.raterSongs
        ,currentlyDraggedSong: state.currentlyDraggedSong 
    }
}



function mapDispatchToProps(dispatch: Dispatch<any>){
    return bindActionCreators({ 
         addSongC :    RaterSongActionCreator 
         ,updateScoreC : function(song) { return RaterSongActionCreator(song, true) }  
    },dispatch) 
}

export default connect(mapStateToProps, mapDispatchToProps as any)(RaterContainer)



