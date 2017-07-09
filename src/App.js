import React, { Component } from 'react';
import TrackBlockContainer from './containers/TrackBlockContainer'
import RaterContainer from './containers/RaterContainer'
import TrackListContainer from './containers/TrackListContainer' 

class App extends Component {

  render() {
    return (
      <div className="App">
        <h1 className="tk-arvo">Visual Rater</h1>
        <div style={{marginTop:'10px'}}> 
          <TrackListContainer></TrackListContainer>
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
              <RaterContainer></RaterContainer> 
              <TrackBlockContainer></TrackBlockContainer> 
            </svg>  
        </div>
      </div>
    );
  }
}

export default App;
