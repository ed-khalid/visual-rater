import React, { useEffect, useState } from 'react';
import './App.css';
import { Rater, GlobalRaterState } from './components/rater/Rater';
import { ItemType } from './models/Item';
import { RatedItem } from './models/RatedItem';
import { Scaler } from './functions/scale';
import { Album, Artist, Song, useGetArtistsQuery , useGetTracksForAlbumLazyQuery } from './generated/graphql';
import { Dashboard } from './components/dashboard/Dashboard';
import { Search, SearchState } from './components/search/Search';
import { ReadOnlyRater } from './components/rater/read-only-rater/ReadOnlyRater';

export const initialSearchState:SearchState = {
  artist:undefined,
  album:undefined,
  artistName:'',
  loading:false
}  

export const RATER_BOTTOM:number = 905; 

export const initialRaterState:GlobalRaterState = {
   start: '0'
  ,end: '5'
  ,scaler : new Scaler() 
  ,itemType: ItemType.MUSIC
} 


function App() {
  const [searchState,setSearchState] = useState<SearchState>(initialSearchState)
  const [raterState, setRaterState] = useState<GlobalRaterState>(initialRaterState)
  const [mainRaterItems, setMainRaterItems] = useState<RatedItem[]>([])
  const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery();  
  const [artists, setArtists] = useState<Artist[]>([]) 
  const [shouldShowSimilar, setShouldShowSimilar] = useState<boolean>(false)
  const [allSongs, setAllSongs] = useState<RatedItem[]>([]); 
  const artistsFull =  useGetArtistsQuery()

  const [dashboardToSearch, setDashboardToSearch] = useState<{artist:Artist,album:Album}|undefined>(); 

  useEffect(() => {
    const newSongs = allSongs.filter(song => !mainRaterItems.find(it => it.id === song.id)) 
    if (newSongs.length !== allSongs.length) {
      setAllSongs(newSongs)
    }
  }, [allSongs,mainRaterItems])

  useEffect(() => {
    const scale = raterState.scaler.yScale.domain([Number(raterState.start), Number(raterState.end)])
    setRaterState(r => ({...r, scaler : new Scaler(scale)}))
  }, [raterState.start, raterState.end, raterState.scaler.yScale])

  const updateScale = (newStart?:string, newEnd?:string) => {
    if (newStart === '') {
      newStart = '0'
    }
    if (newEnd === '') {
      newEnd = '0'
    }
    const start = newStart || raterState.start + ''   
    const end = newEnd || raterState.end  + ''  
    const allowed = new RegExp('^([0-5]+([.][0-9]*)?)$') 
    if (allowed.test(start) && allowed.test(end) ) {
      const startNumber = Number(start)
      const endNumber = Number(end) 
      if (startNumber >= 0 && startNumber < 5 && startNumber < endNumber && endNumber <= 5) {
        setRaterState({...raterState,start,end})
      }
    }
  }

  const soloRater = (album:Album) => {
    setShouldShowSimilar(false)
    onZoomResetClick()
    const ratedItems = album.songs.map(mapSongToRatedItem)
    setMainRaterItems(ratedItems)
  }
  const mapSongToRatedItem  = (song:Song) : RatedItem => new RatedItem({ id: song.id, vendorId:song.vendorId, name: song.name },song.score);

  useEffect(() => {
    if (searchState.album) {
      getTracks({ variables: { albumId: searchState.album.id} })
    }
  }, [searchState.album, getTracks])
  useEffect(() => {
      if (tracks.data?.search?.tracks && searchState.artist) {
  }}, [tracks.data, searchState.artist])
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
        setAllSongs(songs.map(mapSongToRatedItem));
      }
    }
  } , [artistsFull.data, artistsFull.error])

  const onZoomResetClick = () => {
    setRaterState({...raterState,start:'0', end:'5'})
  } 
  const showSimilar =  () => {
    setShouldShowSimilar(true)
  } 

  return (
    <div className="App">
      <header className="font-title">VisRater</header>
      <div className="main grid">
        <div className="empty-cell"></div> 
        <div id="top-controls">
          <label htmlFor="scale-start">Start</label>
          <input id="scale-start" type="text" value={raterState.start} onChange={(e) => updateScale(e.target.value, undefined)}/>
          <label htmlFor="scale-end">End</label>
          <input id="scale-end" type="text" value={raterState.end} onChange={(e) => updateScale(undefined, e.target.value)}/>
          <button onClick={onZoomResetClick}>Reset</button>
          <button onClick={showSimilar}>Compare</button> 
        </div>
        <div className="empty-cell"></div> 
        <div id="search-wrapper">
          <Search 
             refreshWith={dashboardToSearch}
             state={searchState}
             setState={setSearchState}
          />
        </div>
        <svg id="trackRater" viewBox="0 0 790 950">
          {mainRaterItems.length && <Rater 
                setState={setRaterState}
                position={{x:300, y:RATER_BOTTOM}}
                state={raterState}
                items={mainRaterItems}
                setItems={setMainRaterItems}
          >
          </Rater>}
          {shouldShowSimilar &&  
          <ReadOnlyRater
            state = {raterState}
            position={{x:350,y:RATER_BOTTOM}}
            items={allSongs}
          >
          </ReadOnlyRater>
          }
        </svg>
        <Dashboard soloRater={soloRater} openAlbumInSearch={setDashboardToSearch} artists={artists}/>
      </div>
    </div>
  );
}

export default App;
