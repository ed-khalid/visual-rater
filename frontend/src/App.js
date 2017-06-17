import React, { Component } from 'react';
import logo from './logo.svg';
import D3 from './components/D3' 
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1 className="tk-arvo">Visual Rater</h1>
        <div style={{marginTop:'10px'}}> 
          <D3 data ={[5,10,1,13]} size ={ [500,500] } ></D3>
        </div>
      </div>
    );
  }
}

export default App;
