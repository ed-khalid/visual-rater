import React, { Component } from 'react';
import logo from './logo.svg';
import D3 from './components/D3' 
import Song from './models/song'
import TrackDisplayer from './containers/TrackDisplayer'
import Rater from './containers/Rater'
import './App.css';
import * as d3 from 'd3'

class App extends Component {

  render() {
    return (
      <div className="App">
        <h1 className="tk-arvo">Visual Rater</h1>
        <div style={{marginTop:'10px'}}> 
            <svg width="500" height="500">
                <defs>
                    <linearGradient id="linear-gradient" x1="0%" x2="0%" y1="100%" y2="0%">
                      <stop offset="0%" stopColor="black"></stop>
                      <stop offset="25%" stopColor="#ff6666"></stop>
                      <stop offset="60%" stopColor="#fed528"></stop>
                      <stop offset="75%" stopColor="#64db76"></stop>
                      <stop offset="95%" stopColor="#11541b"></stop>
                      <stop offset="100%" stopColor="#black"></stop>
                    </linearGradient>
                  </defs>
              <Rater></Rater> 
              <TrackDisplayer></TrackDisplayer> 
            </svg>  
        </div>
      </div>
    );
  }
}

export default App;
