import React, { useEffect, useState } from 'react';
import './App.css';
import { Unrated } from './components/Unrated';
import { ListControlNav } from './components/ListControlNav';
import { Rater } from './components/Rater';
import { Item, ItemType } from './models/Item';
import { RatedItem } from './models/RatedItem';
import { Scaler } from './functions/scale';
import { Search } from './components/Search';
import { AlbumSearchResult, useGetItemsQuery } from './generated/graphql';
import { SpotifyPlayer } from './components/SpotifyPlayer';


function App() {
  const UNRATED_ITEMS_PAGE_SIZE = 11
  const ITEM_TYPE = ItemType.MUSIC
  const rater = {
      position : {
        x: 500,
        y: 1000
      }
  }
  const [unratedItems, updateUnratedItems] = useState([])  
  const [ratedItems, setRatedItems] = useState<RatedItem[]>([]) 
  const [, updateDraggedItem] = useState<Item|undefined>(undefined) 
  const [chosenAlbum, setChosenAlbum] = useState<AlbumSearchResult|null>(null); 
  const [draggedItemIsAboveRater, updateDraggedItemIsAboveRater] = useState(false)
  const [unratedPageNumber, setUnratedPageNumber] = useState<number>(1) 
  const items =  useGetItemsQuery()
  useEffect(() => {
    if (items.error) {
      console.log(items.error)
    }
    else  {
      if (items.data && items.data.items) {
        setRatedItems(items.data.items.map(it => new RatedItem({ id: it.id, name: it.name },it.score)));
      }
    }
  } , [items.data, items.error])

  const scaler = new Scaler(rater.position.y);   

  return (
    <div className="App">
      <header className="font-title">VisRater</header>
      <div className="main grid">
        <div></div> 
        <div id="top-controls">
          { unratedItems.length > UNRATED_ITEMS_PAGE_SIZE && 
            <ListControlNav setPageNumber={setUnratedPageNumber} numberOfPages={Math.ceil(unratedItems.length/UNRATED_ITEMS_PAGE_SIZE)}  ></ListControlNav> 
          }
        </div>
        <div id="search-wrapper">
          <Search chosenAlbum={chosenAlbum} setChosenAlbum={setChosenAlbum} setUnrated={updateUnratedItems}></Search>
          <SpotifyPlayer albumId={chosenAlbum?.vendorId}></SpotifyPlayer>
        </div>
        <svg id="trackRater" viewBox="0 0 790 652">
          <Unrated 
                  unratedItems={unratedItems} 
                  ratedItems={ratedItems} 
                  onDrag={updateDraggedItem}
                  onRater={updateDraggedItemIsAboveRater}
                  updateItems={[updateUnratedItems, setRatedItems]} 
                  pageNumber={unratedPageNumber}  
                  pageSize = {UNRATED_ITEMS_PAGE_SIZE}
                  scaler={scaler}
                  itemType={ITEM_TYPE}
          > 
          </Unrated>
          <Rater 
                highlight={draggedItemIsAboveRater} 
                position={rater.position}
                ratedItems={ratedItems}  
                updateRatedItems={setRatedItems}
                scaler={scaler}
                itemType={ITEM_TYPE}
          >
          </Rater>
        </svg>
      </div>
    </div>
  );
}

export default App;
