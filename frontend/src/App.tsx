import React from 'react';
import './App.css';
import { Unrated } from './components/Unrated';
import { initialModel } from './models/initialModel';
import { UnratedNav } from './components/UnratedNav';
import { Rater } from './components/Rater';

function App() {
  return (
    <div className="App">
      <header>VisRater</header>
      <div className="main">
        <div className="presection">
          { initialModel.length > 8 && 
          <UnratedNav></UnratedNav> }
        </div>
        <div className="section left">
          <Unrated items={initialModel}> </Unrated>
        </div> 
        <div className="section right">
          <Rater></Rater>
        </div>
      </div>
    </div>
  );
}

export default App;
