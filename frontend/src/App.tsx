import React, { useState } from 'react';
import './App.css';
import { Unrated } from './components/Unrated';
import { initialModel } from './models/initialModel';
import { UnratedNav } from './components/UnratedNav';
import { Rater } from './components/Rater';

function App() {

  const [items, updateItems] = useState(initialModel);  
  return (
    <div className="App">
      <header>VisRater</header>
      <div className="main">
        <div className="presection">
          { items.length > 8 && 
          <UnratedNav></UnratedNav> }
        </div>
        <div className="section left">
          <Unrated items={items}> </Unrated>
        </div> 
        <div className="section right">
          <Rater items={items} onAddItem={updateItems}></Rater>
        </div>
      </div>
    </div>
  );
}

export default App;
