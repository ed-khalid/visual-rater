import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Rater, GlobalRaterState, RaterMode } from './components/rater/Rater';
import { ItemType } from './models/Item';
import { RatedItem } from './models/RatedItem';
import { Scaler } from './functions/scale';
import { Album, AlbumSearchResult, Artist, ArtistSearchResult, GetArtistsDocument, NewSongInput, Song, useCreateAlbumMutation, useGetArtistsQuery , useGetTracksForAlbumLazyQuery } from './generated/graphql';
import { Dashboard } from './components/dashboard/Dashboard';
import { Search } from './components/search/Search';

export const RATER_BOTTOM:number = 905; 

export const initialRaterState:GlobalRaterState = {
   start: '0'
  ,end: '5'
  ,scaler : new Scaler() 
  ,itemType: ItemType.MUSIC
} 


function App() {
  const [searchAlbum, setSearchAlbum] = useState<AlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ArtistSearchResult>()
  const [dashboardAlbum,setDashboardAlbum] = useState<Album>()
  const [dashboardArtist,setDashboardArtist] = useState<Artist>()
  const [raterState, setRaterState] = useState<GlobalRaterState>(initialRaterState)
  const [mainRaterItems, setMainRaterItems] = useState<RatedItem[]>([])
  const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery();  
  const [shouldShowSimilar, setShouldShowSimilar] = useState<boolean>(false)
  const [createAlbum, createAlbumResults] = useCreateAlbumMutation() 
  const [artists, setArtists] = useState<Artist[]>([]) 
  const [allSongs, setAllSongs] = useState<RatedItem[]>([]); 
  const artistsFull =  useGetArtistsQuery()

  useEffect(() => {
    const newSongs = allSongs.filter(song => !mainRaterItems.find(it => it.id === song.id)) 
    if (newSongs.length !== allSongs.length) {
      setAllSongs(newSongs)
    }
  }, [allSongs,mainRaterItems])
  const onZoomResetClick = useCallback(() => {
    setRaterState(prev => ({...prev, start : '0', end : '5'})) 
  }, []) 
  const showSimilar =  () => {
    setShouldShowSimilar(true)
  } 
  const soloRater = useCallback((album:Album, shouldShowSimilar = false ) => {
    onZoomResetClick()
    setShouldShowSimilar(shouldShowSimilar)
    const ratedItems = album.songs.filter(it => it.score).map(mapSongToRatedItem)
    setMainRaterItems(ratedItems)
  },[onZoomResetClick])

  useEffect(() => {
    if (dashboardAlbum?.id) {
      soloRater(dashboardAlbum, true)
    } else {
      setMainRaterItems([])
    }
  }, [dashboardAlbum?.id, soloRater])

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

  const mapSongToRatedItem  = (song:Song) : RatedItem => new RatedItem({ id: song.id, vendorId:song.vendorId, name: song.name },song.score!);

  useEffect(() => {
    setSearchAlbum(undefined)
  }, [searchArtist])

  useEffect(() => {
    if (tracks.data?.search?.tracks && searchArtist && searchAlbum) {
      const songs:NewSongInput[] = tracks.data.search.tracks.map((it,index) => 
        ({ 
          vendorId : it.id, 
          name: it.name, 
          discNumber: it.discNumber, 
          number: it.trackNumber, 
          score: 3.5 - ((index)*0.1)    
        }))
        createAlbum({ variables: { albumInput: {
          vendorId: searchAlbum.id,
          name: searchAlbum.name,
          year: searchAlbum.year,
          thumbnail: searchAlbum.thumbnail
          ,artist: {
            vendorId: searchArtist.id,
            name: searchArtist.name,
            thumbnail: searchArtist.thumbnail
          }, songs
        }}, refetchQueries: [{query: GetArtistsDocument}] })
    }
  },[tracks.data, searchAlbum,searchArtist, createAlbum])

  useEffect(() => {
    if (searchAlbum) {
      getTracks({ variables: { albumId: searchAlbum.id} })
    }
  }, [searchAlbum, getTracks])
  useEffect(() => {
    if (artistsFull.error) {
      console.log(artistsFull.error)
    }
    else  {
      if (artistsFull.data && artistsFull.data.artists) {
        if (createAlbumResults.data && !createAlbumResults.called) {
          const albumId = createAlbumResults.data?.CreateAlbum?.id 
          const artist  = artists.find(it => it.albums?.find(it=> it?.id === albumId) )     
          const album = artist?.albums?.find(it => it?.id === albumId) 
          if (album) {
            soloRater(album)
            setDashboardArtist(artist)
            setDashboardAlbum(album)
          }
        }
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
        setAllSongs(songs.filter(it => it.score).map(mapSongToRatedItem));
      }
    }
  } , [artistsFull.data, artistsFull.error, createAlbumResults.data, createAlbumResults.called, soloRater, artists])


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
             album={searchAlbum}
             artist={searchArtist}
             onAlbumSelect={setSearchAlbum}
             onArtistSelect={setSearchArtist}
          />
        </div>
        <svg id="trackRater" viewBox="0 0 790 950">
          {mainRaterItems.length && <Rater 
                setState={setRaterState}
                position={{x:300, y:RATER_BOTTOM}}
                state={raterState}
                items={mainRaterItems}
                setItems={setMainRaterItems}
                mode={RaterMode.PRIMARY}
          >
          </Rater>}
          {shouldShowSimilar &&  
          <Rater
            state = {raterState}
            setState={setRaterState}
            position={{x:350,y:RATER_BOTTOM}}
            items={allSongs}
            setItems={setAllSongs}
            mode={RaterMode.SECONDARY}
          >
          </Rater>
          }
        </svg>
        <Dashboard selectedArtist={dashboardArtist} selectedAlbum={dashboardAlbum} onAlbumSelect={setDashboardAlbum} onArtistSelect={setDashboardArtist}  artists={artists}/>
      </div>
    </div>
  );
}

export default App;
