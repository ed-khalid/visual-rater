import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Rater, GlobalRaterState, RaterMode } from './components/rater/Rater';
import { ItemType } from './models/Item';
import { RatedItem } from './models/RatedItem';
import { Scaler } from './functions/scale';
import { Album, AlbumSearchResult, Artist, ArtistSearchResult, GetArtistsDocument, GetArtistsQuery, NewSongInput, Song, useCreateAlbumMutation, useGetArtistsQuery , useGetTracksForAlbumLazyQuery } from './generated/graphql';
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
  const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery()
  const [shouldShowSimilar, setShouldShowSimilar] = useState<boolean>(false)
  const [createAlbum, ] = useCreateAlbumMutation() 
  const [artists, setArtists] = useState<Artist[]>([]) 
  const [allSongs, setAllSongs] = useState<RatedItem[]>([]) 
  const [existingArtist, setExistingArtist] = useState<Artist>()
  const artistsFull =  useGetArtistsQuery()

  const mapSongToRatedItem  = (song:Song) : RatedItem => new RatedItem({ id: song.id, vendorId:song.vendorId, name: song.name },song.score!);
  const showSimilar =  () => {
    setShouldShowSimilar(true)
  } 
  const onZoomResetClick = useCallback(() => {
    setRaterState(prev => ({...prev, start : '0', end : '5'})) 
  }, []) 
  const soloRater = useCallback((shouldShowSimilar = false ) => {
    onZoomResetClick()
    setShouldShowSimilar(shouldShowSimilar)
  },[onZoomResetClick])
  const updateSearchArtist = useCallback((artist?:ArtistSearchResult) => {
      setSearchArtist(artist)
      if (artist) {
        const existingArtist = artists.find(it => it.vendorId === artist?.id)
          setExistingArtist(existingArtist)
      }
  }, [artists])
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

  useEffect(() => {
    if (dashboardAlbum?.id) {
      const ratedItems = dashboardAlbum.songs.filter(it => it.score).map(mapSongToRatedItem)
      setMainRaterItems(ratedItems)
      soloRater(true)
      const newSongs = allSongs.filter(song => !ratedItems.find(it => it.id === song.id)) 
      if (newSongs.length !== allSongs.length) {
        setAllSongs(newSongs)
      }
    } else {
      setMainRaterItems([])
    }
  }, [allSongs, dashboardAlbum?.id])

  useEffect(() => {
    const scale = raterState.scaler.yScale.domain([Number(raterState.start), Number(raterState.end)])
    setRaterState(r => ({...r, scaler : new Scaler(scale)}))
  }, [raterState.start, raterState.end, raterState.scaler.yScale])


  useEffect(() => {
    if (tracks.data?.search?.tracks && searchAlbum && searchArtist) {
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
        }}, update: (cache, data)=> { 
          const result = cache.readQuery<GetArtistsQuery>({query: GetArtistsDocument})
          const newAlbum = data.data?.CreateAlbum!
          const queryArtists = [...result!.artists!] 
          const frozenArtist = queryArtists.find(it => it.vendorId === searchArtist.id )
          if (frozenArtist) {
            const artist = {
              ...frozenArtist
            } 
            const otherArtists = queryArtists.filter( it => it.vendorId !== searchArtist.id)
            if (artist) {
              const albums = [...artist.albums!]
              artist.albums = [...albums!, newAlbum ] 
              cache.writeQuery<GetArtistsQuery>({ query: GetArtistsDocument, data : { artists : [...otherArtists, artist]}    })
            }
            const dashboardArtist = artists.find(it => it.id === artist.id)  
            if (dashboardArtist) {
              setDashboardArtist(dashboardArtist)
              setDashboardAlbum({ 
                id: newAlbum.id, 
                name: newAlbum.name,
                vendorId: newAlbum.vendorId,
                thumbnail: newAlbum.thumbnail, 
                year: newAlbum.year,
                songs:newAlbum.songs.map(it => ({...it, artist: dashboardArtist }) )
              })
            }
          }
        }})
    }
  }, [tracks.data?.search?.tracks])


  const updateSearchAlbum = async (album:AlbumSearchResult) => {
    setSearchAlbum(album)
    getTracks({ variables: { albumId: album.id} })
  }

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
        setAllSongs(songs.filter(it => it.score).map(mapSongToRatedItem));
      }
    }
  } , [artistsFull.data, artistsFull.error, soloRater, artists])


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
             existingArtist={existingArtist}
             onAlbumSelect={updateSearchAlbum}
             onArtistSelect={updateSearchArtist}
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
