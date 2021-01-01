import React, { useEffect, useState } from 'react';
import './App.css';
import { Unrated } from './components/Unrated';
import { ListControlNav } from './components/ListControlNav';
import { Rater } from './components/Rater';
import { Item, ItemType } from './models/Item';
import { RatedItem } from './models/RatedItem';
import { Scaler } from './functions/scale';
import { Search } from './components/Search';
import { AlbumSearchResult, ArtistSearchResult, useGetItemsQuery, useGetTracksForAlbumLazyQuery } from './generated/graphql';
import { SpotifyPlayer } from './components/SpotifyPlayer';
import { NewSong } from './models/music/Song';


function App() {
  const UNRATED_ITEMS_PAGE_SIZE = 15
  const ITEM_TYPE = ItemType.MUSIC
  const rater = {
      position : {
        x: 300,
        y: 905
      }
  }
  const [unratedItems, updateUnratedItems] = useState<Item[]>([])  
  const [ratedItems, setRatedItems] = useState<RatedItem[]>([]) 
  const [, updateDraggedItem] = useState<Item|undefined>(undefined) 
  const [chosenAlbum, setChosenAlbum] = useState<AlbumSearchResult|undefined>(undefined); 
  const [draggedItemIsAboveRater, updateDraggedItemIsAboveRater] = useState(false)
  const [unratedPageNumber, setUnratedPageNumber] = useState<number>(1) 
  const [draggedAlbum, setDraggedAlbum] = useState<AlbumSearchResult|undefined>(undefined) 
  const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery();  
  const [scaler, setScaler] = useState<Scaler>(new Scaler(rater.position.y))
  const [chosenArtist, setChosenArtist] = useState<ArtistSearchResult|undefined>(undefined); 
  const items =  useGetItemsQuery()

  useEffect(() => {
    if (chosenAlbum) {
      getTracks({ variables: { albumId: chosenAlbum.id} })
    }
  }, [chosenAlbum])
  useEffect(() => {
      if (tracks.data?.search?.tracks && chosenAlbum && chosenArtist) {
          let { albums, ...artistWithoutAlbums } = chosenArtist  
          const unratedSongs:NewSong[] = tracks.data.search.tracks.map(track =>({ id:track.id, vendorId:track.id, name:track.name, artist:artistWithoutAlbums , album:chosenAlbum, number:track.trackNumber}))
          updateUnratedItems(unratedSongs)
  }}, [tracks.data])
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

  const handleAlbumDragOver = (e:any) => {
    e.preventDefault()
  }
  const handleAlbumDrop = (e:React.DragEvent<SVGSVGElement>) => {
    if (draggedAlbum) {
      setChosenAlbum(draggedAlbum)
      setDraggedAlbum(undefined)
    }
  }

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
          <Search 
             chosenAlbum={chosenAlbum} 
             setChosenAlbum={setChosenAlbum} 
             setChosenArtist={setChosenArtist}
             setDraggedAlbum={setDraggedAlbum}
             setUnrated={updateUnratedItems}
          />
          <SpotifyPlayer albumId={chosenAlbum?.id}></SpotifyPlayer>
        </div>
        <svg onDragOver={(e) => handleAlbumDragOver(e)} onDrop={(e) => handleAlbumDrop(e) } id="trackRater" viewBox="0 0 790 950">
          <Unrated 
                  unratedItems={unratedItems} 
                  ratedItems={ratedItems} 
                  onDrag={updateDraggedItem}
                  onRater={updateDraggedItemIsAboveRater}
                  raterPosition={rater.position}
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
                setScaler={setScaler}
                itemType={ITEM_TYPE}
          >
          </Rater>
        </svg>
      </div>
    </div>
  );
}

export default App;
