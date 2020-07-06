import React, { useState } from 'react';
import './App.css';
import { Unrated } from './components/Unrated';
import { initialModel } from './models/initialModel';
import { UnratedNav } from './components/UnratedNav';
import { Rater } from './components/Rater';
import { Item } from './models/Item';
import { RatedItem } from './models/RatedItem';
import { Position} from './models/Position';
import { Scaler } from './functions/scale';
import { Song, Artist } from './models/music';

const newRatedItem = new RatedItem(new Song(0,0,'Hello',new Artist(0, 'Saadoon Jabir')), 70); 

type AppState = {
  unratedItems:Item[];
  ratedItems:RatedItem[];
  rater : {
    position: Position 
  }
  draggedItem?:Item|undefined;
  draggedItemIsAboveRater:boolean;
} 

function App() {
  const [unratedItems, updateUnratedItems] = useState(initialModel);  
  const [ratedItems, updateRatedItems] = useState<RatedItem[]>([newRatedItem]); 
  const [draggedItem, updateDraggedItem] = useState<Item|undefined>(undefined); 
  const [draggedItemIsAboveRater, updateDraggedItemIsAboveRater] = useState(false); 

  const appState:AppState = {
    unratedItems,
    ratedItems,
    rater: {
      position : {
        x: 500,
        y: 1000
      }
    },
    draggedItem,  
    draggedItemIsAboveRater
  }

  const scaler = new Scaler(appState.rater.position.y);   

  return (
    <div className="App">
      <header>VisRater</header>
      <div className="main">
        <div
        >
          { appState.unratedItems.length > 8 && 
          <UnratedNav></UnratedNav> }
        </div>
        <svg viewBox="0 0 1000 740">
          <Unrated 
                   unratedItems={appState.unratedItems} 
                   ratedItems={appState.ratedItems} 
                   onDrag={updateDraggedItem}
                   onRater={updateDraggedItemIsAboveRater}
                   updateItems={[updateUnratedItems, updateRatedItems]} 
                   scaler={scaler}
          > 
          </Unrated>
          <Rater 
                 highlight={appState.draggedItemIsAboveRater} 
                 position={appState.rater.position}
                 ratedItems={appState.ratedItems}  
                 updateRatedItems={updateRatedItems}
                 scaler={scaler}
          >
           </Rater>
        </svg>
      </div>
    </div>
  );
}

export default App;
