import React, { useEffect, useState } from 'react';
import './App.css';
import { Unrated } from './components/Unrated';
import { ListControlNav } from './components/ListControlNav';
import { Rater } from './components/rater/Rater';
import { Item, ItemType } from './models/Item';
import { RatedItem } from './models/RatedItem';
import { Scaler } from './functions/scale';
import { Album, Artist, Song, useGetArtistsQuery , useGetTracksForAlbumLazyQuery } from './generated/graphql';
import { NewSong } from './models/music/Song';
import { Dashboard } from './components/dashboard/Dashboard';
import { Search, SearchState } from './components/search/Search';

export const AppConstants = {
  rater : {
      position : {
        x: 300,
        y: 905
      }
  }
}


export const initialSearchState:SearchState = {
  artist:undefined,
  album:undefined,
  artistName:'',
  loading:false
}  




function App() {
  const UNRATED_ITEMS_PAGE_SIZE = 15
  const ITEM_TYPE = ItemType.MUSIC
  const [searchState,setSearchState] = useState<SearchState>(initialSearchState); 
  const [unratedItems, setUnratedItems] = useState<Item[]>([])  
  const [ratedItems, setRatedItems] = useState<RatedItem[]>([]) 
  const [, updateDraggedItem] = useState<Item|undefined>(undefined) 
  const [draggedItemIsAboveRater, setDraggedItemIsAboveRater] = useState(false)
  const [unratedPageNumber, setUnratedPageNumber] = useState<number>(1) 
  const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery();  
  const [scaler, setScaler] = useState<Scaler>(new Scaler())
  const [artists, setArtists] = useState<Artist[]>([]) 
  const [zoomReset, setZoomReset] = useState<boolean>(false)
  const artistsFull =  useGetArtistsQuery()

  const [dashboardToSearch, setDashboardToSearch] = useState<{artist:Artist,album:Album}|undefined>(); 

  const soloRater = (album:Album) => {
    setRatedItems(album.songs.map(mapSongToRatedItem))
  }

  const mapSongToRatedItem  = (song:Song) : RatedItem => new RatedItem({ id: song.id, vendorId:song.vendorId, name: song.name },song.score);

  useEffect(() => {
    if (searchState.album) {
      getTracks({ variables: { albumId: searchState.album.id} })
    }
  }, [searchState.album])
  useEffect(() => {
      if (tracks.data?.search?.tracks && searchState.artist) {
          let { albums, ...artistWithoutAlbums } = searchState.artist  
          let unratedSongs:NewSong[] = tracks.data.search.tracks.map(track =>({ id:track.id, vendorId:track.id, name:track.name, artist:artistWithoutAlbums , album:searchState.album, number:track.trackNumber, discNumber: track.discNumber}))
          unratedSongs = unratedSongs.filter(it => !ratedItems.find(rIt => ((rIt as Song).vendorId === it.id)))
          setUnratedItems(unratedSongs)
  }}, [tracks.data])
  useEffect(() => {
    if (artistsFull.error) {
      console.log(artistsFull.error)
    }
    else  {
      if (artistsFull.data && artistsFull.data.artists) {
        setArtists(artistsFull.data.artists)
        const songs:Song[] = artistsFull.data.artists.reduce((curr:Song[],it) => {
          if (it.albums) {
            it.albums.forEach(album => {
              if (album && album.songs) {
                album.songs.forEach(song => {
                  if (song) {
                    curr.push( { ...song, artist: it  })
                  }
                })
              }
            })
          }
          return curr
        },[])
        setRatedItems(songs.map(mapSongToRatedItem))
      }
    }
  } , [artistsFull.data, artistsFull.error])

  const onZoomResetClick = () => {
    setZoomReset(true)
    setTimeout(() => { setZoomReset(false) } , 1000)
  } 

  return (
    <div className="App">
      <header className="font-title">VisRater</header>
      <div className="main grid">
        <div className="empty-cell"></div> 
        <div id="top-controls">
          { unratedItems.length > UNRATED_ITEMS_PAGE_SIZE && 
            <ListControlNav setPageNumber={setUnratedPageNumber} numberOfPages={Math.ceil(unratedItems.length/UNRATED_ITEMS_PAGE_SIZE)}  ></ListControlNav> 
          }
          <button onClick={onZoomResetClick}>Reset</button>
        </div>
        <div className="empty-cell"></div> 
        <div id="search-wrapper">
          <Search 
             refreshWith={dashboardToSearch}
             state={searchState}
             setState={setSearchState}
             setUnrated={setUnratedItems}
          />
        </div>
        <svg id="trackRater" viewBox="0 0 790 950">
          <Unrated 
                  unratedItems={unratedItems} 
                  ratedItems={ratedItems} 
                  onDrag={updateDraggedItem}
                  onRater={setDraggedItemIsAboveRater}
                  updateItems={[setUnratedItems, setRatedItems]} 
                  pageNumber={unratedPageNumber}  
                  pageSize = {UNRATED_ITEMS_PAGE_SIZE}
                  scaler={scaler}
                  itemType={ITEM_TYPE}
          > 
          </Unrated>
          <Rater 
                highlight={draggedItemIsAboveRater} 
                ratedItems={ratedItems}  
                zoomReset={zoomReset}
                updateRatedItems={setRatedItems}
                scaler={scaler}
                setScaler={setScaler}
                itemType={ITEM_TYPE}
          >
          </Rater>
        </svg>
        <Dashboard soloRater={soloRater} openAlbumInSearch={setDashboardToSearch} artists={artists}/>
      </div>
    </div>
  );
}

export default App;
