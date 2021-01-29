import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { Rater, GlobalRaterState, RaterMode } from './components/rater/Rater';
import { ItemType } from './models/Item';
import { RatedItem } from './models/RatedItem';
import { Scaler } from './functions/scale';
import { AlbumSearchResult, Artist, ArtistSearchResult, GetArtistsDocument, GetArtistsQuery, NewSongInput, Song, useCreateAlbumMutation, useCreateArtistMutation, useGetArtistsQuery , useGetTracksForAlbumLazyQuery } from './generated/graphql';
import { zoomIdentity } from 'd3-zoom'
import { Dashboard } from './components/dashboard/Dashboard';
import { Search } from './components/search/Search';
import { Unrated } from './components/Unrated';

export const RATER_BOTTOM:number = 905; 

export const initialRaterState:GlobalRaterState = {
   start: '0'
  ,end: '5'
  ,scaler : new Scaler() 
  ,itemType: ItemType.MUSIC
} 

enum SearchOrDashboardAlbum {
  SEARCH, DASHBOARD
}  
enum OtherRaterView {
  ARTIST,EVERYONE,NONE
} 



function App() {
  const [searchAlbum, setSearchAlbum] = useState<AlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ArtistSearchResult>()
  const [dashboardAlbumId,setDashboardAlbumId] = useState<string>()
  const [dashboardArtistId,setDashboardArtistId] = useState<string>()
  const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery()
  const [createAlbum, ] = useCreateAlbumMutation() 
  const [createArtist, createArtistResult ] = useCreateArtistMutation() 
  const [searchOrDashboardAlbum, setSearchOrDashboardAlbum] = useState<SearchOrDashboardAlbum>()
  const [existingArtist, setExistingArtist] = useState<Artist>()
  const gWrapper = useRef<SVGGElement>(null)
  const artistsFull =  useGetArtistsQuery()
  // rater items
  const [otherRaterView, setOtherRaterView] = useState<OtherRaterView>(OtherRaterView.NONE)
  const [raterState, setRaterState] = useState<GlobalRaterState>(initialRaterState)
  const [mainRaterItems, setMainRaterItems] = useState<RatedItem[]>([])
  const [otherSongs, setOtherSongs] = useState<RatedItem[]>([]) 


  const mapSongToRatedItem  = (song:any) : RatedItem => new RatedItem({ id: song.id, vendorId:song.vendorId, name: song.name },song.score!);
  const onZoomResetClick = useCallback(() => {
    const resetScale = zoomIdentity.rescaleY(raterState.scaler.yScale) 
    setRaterState(prev => ({...prev, scaler: new Scaler(resetScale)})) 
  }, []) 
  const updateSearchArtist = useCallback((artist?:ArtistSearchResult) => {
      setSearchArtist(artist)
      if (artist) {
        const existingArtist = artistsFull.data?.artists?.find(it => it.vendorId === artist?.id)
          setExistingArtist(existingArtist as Artist)
      }
  }, [artistsFull.data?.artists])
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
    if (artistsFull.data?.artists) {
        const songs:Song[] = artistsFull.data.artists.reduce((curr:Song[],it) => {
          if (it.albums) {
            it.albums.forEach(album => {
              if (album && album.songs) {
                album.songs.forEach(song => {
                  if (song) {
                    curr.push( { ...song, artist: it as Artist })
                  }
                })
              }
            })
          }
          return curr
        },[])
      if (searchOrDashboardAlbum === SearchOrDashboardAlbum.SEARCH && searchAlbum?.id && searchArtist?.id) {
            const dashboardArtist:Artist = artistsFull.data?.artists?.find(it => it.vendorId === searchArtist.id) as Artist
            const dashboardAlbum = dashboardArtist.albums?.find(it => it?.vendorId === searchAlbum.id) 
            if (dashboardArtist && dashboardAlbum) {
              updateDashboardAlbum(dashboardAlbum.id, dashboardArtist.id)
            }
      } else {
      if (searchOrDashboardAlbum === SearchOrDashboardAlbum.DASHBOARD && dashboardAlbumId) {
        const album = artistsFull.data.artists.find(it=> it.albums?.find(it => it?.id === dashboardAlbumId))?.albums!.find(it => it?.id === dashboardAlbumId)  
        const ratedItems:RatedItem[] = album!.songs.filter(it => it.score).map(mapSongToRatedItem)
        setMainRaterItems(ratedItems)
        let _otherSongs:Song[];
        switch(otherRaterView) {
          case OtherRaterView.ARTIST:  
             _otherSongs = songs.filter(song => !ratedItems.find(it => it.id === song.id))
             _otherSongs = _otherSongs.filter(it => it.artist.id === dashboardArtistId)
             break;
          case OtherRaterView.EVERYONE:
             _otherSongs = songs.filter(song => !ratedItems.find(it => it.id === song.id))
             break;
          case OtherRaterView.NONE:
            _otherSongs = [] 
        }
        setOtherSongs(_otherSongs.filter(it => it.score).map(mapSongToRatedItem))
      } else {
          setMainRaterItems([])
           const _otherSongs = songs.filter(it => it.score).map(mapSongToRatedItem)
          setOtherSongs(_otherSongs)
        }
      }
    }
  }, [dashboardAlbumId, artistsFull.data?.artists, otherRaterView])

  // scale
  // useEffect(() => {
  //   const scale = raterState.scaler.yScale.domain([Number(raterState.start), Number(raterState.end)])
  //   setRaterState(r => ({...r, scaler : new Scaler(scale)}))
  // }, [raterState.scaler])


  // search album click get tracks  
  useEffect(() => {
    if (tracks.data?.search?.tracks && searchAlbum && searchArtist) {
    const doCreateAlbum = (frozenArtist:any) => { 
      const songs:NewSongInput[] = tracks!.data!.search!.tracks.map((it,index) => 
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
          thumbnail: searchAlbum.thumbnail,
          artistId:frozenArtist.id,
          songs
        }}, update: (cache, data)=> { 
          const artist = {
            ...frozenArtist
          }  
          const result = cache.readQuery<GetArtistsQuery>({query: GetArtistsDocument})
          const newAlbum = data.data?.CreateAlbum!
          const queryArtists = [...result!.artists!] 
          const otherArtists = queryArtists.filter( it => it.vendorId !== searchArtist.id)
          const albums = [...artist.albums!]
          artist.albums = [...albums!, newAlbum ] 
          cache.writeQuery<GetArtistsQuery>({ query: GetArtistsDocument, data : { artists : [...otherArtists, artist]}    })
        }
      })
     }
      const artist = artistsFull.data?.artists?.find(it => it.vendorId === searchArtist.id)   
      if (!artist) {
        createArtist({
          variables: {
            artistInput : {
              name: searchArtist.name, 
              vendorId: searchArtist.id,
              thumbnail: searchArtist.thumbnail
            }
          }, update:  (cache, data) => {
             const artist = data.data?.CreateArtist
             doCreateAlbum(artist)
          }
        })
      } else {
        doCreateAlbum(artist)
      }
    }
  }, [tracks.data?.search?.tracks, createAlbum])

  // album selections 
  const updateSearchAlbum = (album:AlbumSearchResult) => {
    setSearchAlbum(album)
    setSearchOrDashboardAlbum(SearchOrDashboardAlbum.SEARCH)
    getTracks({ variables: { albumId: album.id} })
  }
  const updateDashboardAlbum =  (albumId?:string, artistId?:string) => {
      setSearchOrDashboardAlbum(SearchOrDashboardAlbum.DASHBOARD)
      setDashboardAlbumId(albumId)
      setDashboardArtistId(artistId)
      // if (albumId) {
      //   soloRater()
      // }
  } 

  const toggleOtherView = (newView:OtherRaterView) => {
    if (otherRaterView === newView) {
      setOtherRaterView(OtherRaterView.NONE)
    } else {
      setOtherRaterView(newView)
    }
  }

  return (
    <div className="App">
      <header className="font-title">VisRater</header>
      <div className="main grid">
        <div className="empty-cell"></div> 
        <div id="top-controls" className="flex">
          <label htmlFor="scale-start">Start</label>
          <input id="scale-start" type="text" value={raterState.start} onChange={(e) => updateScale(e.target.value, undefined)}/>
          <label htmlFor="scale-end">End</label>
          <input id="scale-end" type="text" value={raterState.end} onChange={(e) => updateScale(undefined, e.target.value)}/>
          <div>
            <button onClick={onZoomResetClick}>Reset</button>
          </div>
          {mainRaterItems?.length > 0 && <div className="compare-section">
            <button className={`${otherRaterView === OtherRaterView.ARTIST ? 'selected' : ''}`} onClick={() => toggleOtherView(OtherRaterView.ARTIST) }>artist</button>
            <button  className={`${otherRaterView === OtherRaterView.EVERYONE ? 'selected' : ''}`}  onClick={() => toggleOtherView(OtherRaterView.EVERYONE) }>everyone</button>
          </div>}
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
        <svg id="trackRater" viewBox="0 0 1000 950">
          <defs>
            <clipPath id="clip-path">
              <rect x={0} width="1000" height={RATER_BOTTOM}></rect>
            </clipPath>
          </defs>
          <g ref={gWrapper} id="wrapper">
          {mainRaterItems.length && <Rater 
                setState={setRaterState}
                position={{x:300, y:RATER_BOTTOM}}
                state={raterState}
                zoomTarget={gWrapper.current}
                items={mainRaterItems}
                setItems={setMainRaterItems}
                mode={RaterMode.PRIMARY}
          >
          </Rater>}
          {otherRaterView !== OtherRaterView.NONE &&  
          <Rater
            state = {raterState}
            setState={setRaterState}
            position={{x:350,y:RATER_BOTTOM}}
            items={otherSongs}
            setItems={setOtherSongs}
            mode={RaterMode.SECONDARY}
          >
          </Rater>
          }
          </g>
        </svg>
        <Dashboard 
          selectedArtistId={dashboardArtistId} 
          selectedAlbumId={dashboardAlbumId} 
          onAlbumSelect={updateDashboardAlbum} 
          artists={artistsFull.data?.artists as Artist[]}
        />
      </div>
    </div>
  );
}

export default App;
