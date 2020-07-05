import React, { useState } from 'react';
import './App.css';
import { Unrated } from './components/Unrated';
import { initialModel } from './models/initialModel';
import { UnratedNav } from './components/UnratedNav';
import { Rater } from './components/Rater';
import { Item } from './models/Item';
import { Position} from './models/Position';

type AppState = {
  unratedItems:Item[];
  ratedItems:Item[];
  rater : {
    position: Position 
  }
  draggedItem?:Item|undefined;
  draggedItemIsAboveRater:boolean;
} 

function App() {
  const [unratedItems, updateUnratedItems] = useState(initialModel);  
  const [ratedItems, updateRatedItems] = useState<Item[]>([]); 
  const [draggedItem, updateDraggedItem] = useState<Item|undefined>(undefined); 
  const [draggedItemIsAboveRater, updateDraggedItemIsAboveRater] = useState(false); 

  const appState:AppState = {
    unratedItems,
    ratedItems,
    rater: {
      position : {
        x: 500,
        y: 0
      }
    },
    draggedItem,  
    draggedItemIsAboveRater
  }

  return (
    <div className="App">
      <header>VisRater</header>
      <div className="main">
        <div
        >
          { appState.unratedItems.length > 8 && 
          <UnratedNav></UnratedNav> }
        </div>
        <svg viewBox="0 0 1000 700">
          <Unrated 
                   unratedItems={appState.unratedItems} 
                   ratedItems={appState.ratedItems} 
                   onDrag={updateDraggedItem}
                   onRater={updateDraggedItemIsAboveRater}
                   updateItems={[updateUnratedItems, updateRatedItems]} 
          > 
          </Unrated>
          <Rater 
                 highlight={appState.draggedItemIsAboveRater} 
                 position={appState.rater.position}
                 ratedItems={appState.ratedItems}  
          >
           </Rater>
        </svg>
      </div>
    </div>
  );
}

export default App;
