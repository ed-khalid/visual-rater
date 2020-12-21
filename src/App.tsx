import React, { useState } from 'react';
import './App.css';
import { Unrated } from './components/Unrated';
import { UnratedNav } from './components/UnratedNav';
import { Rater } from './components/Rater';
import { Item, ItemType } from './models/Item';
import { RatedItem } from './models/RatedItem';
import { Position} from './models/Position';
import { Scaler } from './functions/scale';
import { Search } from './components/Search';

type AppState = {
  unratedItems:Item[];
  ratedItems:RatedItem[];
  rater : {
    position: Position 
  }
  draggedItem?:Item|undefined;
  draggedItemIsAboveRater:boolean;
  itemType:ItemType
} 

function App() {
  const [unratedItems, updateUnratedItems] = useState([]);  
  const [ratedItems, updateRatedItems] = useState<RatedItem[]>([]); 
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
    draggedItemIsAboveRater,
    itemType : ItemType.MUSIC  
  }

  const scaler = new Scaler(appState.rater.position.y);   

  return (
    <div className="App">
      <header>VisRater</header>
      <div className="main grid">
        <div id="search-wrapper">
          <Search setUnrated={updateUnratedItems}></Search>
          { appState.unratedItems.length > 8 && 
          <UnratedNav></UnratedNav> 
          }
        </div>
        <svg id="trackRater" viewBox="0 0 790 447">
          <Unrated 
                  unratedItems={appState.unratedItems} 
                  ratedItems={appState.ratedItems} 
                  onDrag={updateDraggedItem}
                  onRater={updateDraggedItemIsAboveRater}
                  updateItems={[updateUnratedItems, updateRatedItems]} 
                  scaler={scaler}
                  itemType={appState.itemType}
          > 
          </Unrated>
          <Rater 
                highlight={appState.draggedItemIsAboveRater} 
                position={appState.rater.position}
                ratedItems={appState.ratedItems}  
                updateRatedItems={updateRatedItems}
                scaler={scaler}
                itemType={appState.itemType}
          >
          </Rater>
        </svg>
      </div>
    </div>
  );
}

export default App;
