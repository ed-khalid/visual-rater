import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Unrated } from './components/Unrated';
import { initialModel } from './models/initialModel';

function App() {
  return (
    <div className="App">
      <header>VisRater</header>
      <div className="main">
        <div className="section left">
          <Unrated items={initialModel}> </Unrated>
        </div> 
        <div className="section right">
        </div>
      </div>
    </div>
  );
}

export default App;
