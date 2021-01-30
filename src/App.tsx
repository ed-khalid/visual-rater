import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import { GlobalRaterState } from './components/rater/Rater';
import { Scaler } from './functions/scale';
import { AlbumSearchResult, Artist, ArtistSearchResult, GetArtistsDocument, GetArtistsQuery, NewSongInput, Song, useCreateAlbumMutation, useCreateArtistMutation, useGetArtistsQuery , useGetTracksForAlbumLazyQuery } from './generated/graphql';
import { zoomIdentity } from 'd3-zoom'
import { Dashboard } from './components/dashboard/Dashboard';
import { Search } from './components/search/Search';
import { RaterWrapper } from './components/rater/RaterWrapper';
import { ItemType } from './models/Item';

export const RATER_BOTTOM:number = 905; 

export const initialRaterState:GlobalRaterState = {
   start: '0'
  ,end: '5'
  ,scaler : new Scaler() 
  ,itemType: ItemType.MUSIC
} 

export enum SearchOrDashboardAlbum {
  SEARCH, DASHBOARD
}  
export enum OtherRaterView {
  ARTIST,EVERYONE,NONE
} 

function App() {
  const [searchAlbum, setSearchAlbum] = useState<AlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ArtistSearchResult>()
  const [dashboardAlbumId,setDashboardAlbumId] = useState<string>()
  const [dashboardArtistId,setDashboardArtistId] = useState<string>()
  const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery()
  const [createAlbum, ] = useCreateAlbumMutation() 
  const [createArtist, ] = useCreateArtistMutation() 
  const [searchOrDashboardAlbum, setSearchOrDashboardAlbum] = useState<SearchOrDashboardAlbum>()
  const [existingArtist, setExistingArtist] = useState<Artist>()
  const artistsFull =  useGetArtistsQuery()
  // rater items
  const [otherRaterView, setOtherRaterView] = useState<OtherRaterView>(OtherRaterView.NONE)
  const [raterState, setRaterState] = useState<GlobalRaterState>(initialRaterState)


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

  // const updateScale = (newStart?:string, newEnd?:string) => {
  //   if (newStart === '') {
  //     newStart = '0'
  //   }
  //   if (newEnd === '') {
  //     newEnd = '0'
  //   }
  //   const start = newStart || raterState.start + ''   
  //   const end = newEnd || raterState.end  + ''  
  //   const allowed = new RegExp('^([0-5]+([.][0-9]*)?)$') 
  //   if (allowed.test(start) && allowed.test(end) ) {
  //     const startNumber = Number(start)
  //     const endNumber = Number(end) 
  //     if (startNumber >= 0 && startNumber < 5 && startNumber < endNumber && endNumber <= 5) {
  //       setRaterState({...raterState,start,end})
  //     }
  //   }
  // }

  useEffect(() => {
    if (searchOrDashboardAlbum === SearchOrDashboardAlbum.SEARCH && searchAlbum?.id && searchArtist?.id) {
       const dashboardArtist:Artist = artistsFull?.data?.artists?.find(it => it.vendorId === searchArtist.id) as Artist
       const dashboardAlbum = dashboardArtist.albums?.find(it => it?.vendorId === searchAlbum.id) 
       if (dashboardArtist && dashboardAlbum) {
          updateDashboardAlbum(dashboardAlbum.id, dashboardArtist.id)
       }
    }
  }, [searchOrDashboardAlbum, artistsFull.data?.artists, searchAlbum?.id, searchArtist?.id])

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
        <div className="empty-cell" style={{maxWidth: '450px'}}></div> 
        <div id="top-controls" className="flex">
          <div>
            <button onClick={onZoomResetClick}>Reset</button>
          </div>
          {dashboardAlbumId && <div className="compare-section">
            <button className={`${otherRaterView === OtherRaterView.ARTIST ? 'selected' : ''}`} onClick={() => toggleOtherView(OtherRaterView.ARTIST) }>artist</button>
            <button  className={`${otherRaterView === OtherRaterView.EVERYONE ? 'selected' : ''}`}  onClick={() => toggleOtherView(OtherRaterView.EVERYONE) }>everyone</button>
          </div>}
        </div>
        <div className="empty-cell"></div> 
        <Search 
             album={searchAlbum}
             artist={searchArtist}
             existingArtist={existingArtist}
             onAlbumSelect={updateSearchAlbum}
             onArtistSelect={updateSearchArtist}
        />
        <RaterWrapper
          searchOrDashboardAlbum={searchOrDashboardAlbum}
          artists={artistsFull.data?.artists}
          otherRaterView={otherRaterView}
          state={raterState}
          setState={setRaterState}
          dashboardAlbumId={dashboardAlbumId}
          dashboardArtistId={dashboardArtistId}
        />
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
