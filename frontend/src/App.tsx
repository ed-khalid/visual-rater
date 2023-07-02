import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import { GlobalRaterState } from './components/rater/Rater';
import { Scaler } from './functions/scale';
import {  ExternalAlbumSearchResult, Artist, ExternalArtistSearchResult, GetArtistsDocument, GetArtistsQuery, NewSongInput, useCreateAlbumMutation, useCreateArtistMutation, useGetArtistsQuery , useGetTracksForSearchAlbumQuery, useGetTracksForSearchAlbumLazyQuery, Song, Album } from './generated/graphql';
import { zoomIdentity } from 'd3-zoom'
import { Dashboard } from './components/dashboard/Dashboard';
import { Search } from './components/search/Search';
import { ItemType } from './models/Item';
import { ExternalFullSearchResult } from './models/ExternalFullSearchResult';
import { SongFull } from './models/SongFull';
import { RaterWrapper } from './components/rater/RaterWrapper';

export const RATER_BOTTOM:number = 600; 

export const initialRaterState:GlobalRaterState = {
   start: '0'
  ,end: '5'
  ,scaler : new Scaler() 
  ,itemType: ItemType.MUSIC
} 

export enum OtherRaterView {
  ARTIST,EVERYONE,NONE
} 

function App() {

  const [searchAlbum, setSearchAlbum] = useState<ExternalAlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult>()
  const [searchArtistAlbumTracks, setSearchArtistAlbumTracks] = useState<ExternalFullSearchResult>()

  const [getTracks, getTracksResult ] = useGetTracksForSearchAlbumLazyQuery()
  const [createAlbum, ] = useCreateAlbumMutation() 
  const [createArtist, ] = useCreateArtistMutation() 

  const [dashboardAlbum,setDashboardAlbum] = useState<Album>()
  const [dashboardArtist,setDashboardArtist] = useState<Artist>()


  const artistsFull =  useGetArtistsQuery()
  // rater items
  const [raterState, setRaterState] = useState<GlobalRaterState>(initialRaterState)


  const onExternalAlbumSearchClick =  (artist:ExternalArtistSearchResult, album:ExternalAlbumSearchResult) => {
    setSearchArtist(artist)
    setSearchAlbum(album)
  }
  useEffect(() => {
    if (searchAlbum) {
      getTracks({ variables: { albumId: searchAlbum.id} })
    }
  }, [searchAlbum, getTracks])

  const onZoomResetClick = useCallback(() => {
    const resetScale = zoomIdentity.rescaleY(raterState.scaler.yScale) 
    setRaterState(prev => ({...prev, scaler: new Scaler(resetScale)})) 
  }, []) 

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
    if (getTracksResult.data?.searchExternalAlbumTracks && searchArtist && searchAlbum) {
      setSearchArtistAlbumTracks({
        artist: searchArtist,
        album: searchAlbum,
        tracks: getTracksResult.data?.searchExternalAlbumTracks 
      })
      setSearchArtist(undefined)
      setSearchAlbum(undefined)
    }
  }, [getTracksResult.data?.searchExternalAlbumTracks, searchArtist, searchAlbum ] )

  useEffect(() => { 
    if (searchArtistAlbumTracks) {
    const doCreateAlbum = (frozenArtist:any) => { 
      const songs:NewSongInput[] = searchArtistAlbumTracks.tracks.map((it,index) => 
        ({ 
          name: it.name, 
          discNumber: it.discNumber, 
          number: it.trackNumber, 
          score: 3.5 - ((index)*0.1)    
        }))
        createAlbum({ variables: { albumInput: {
          name: searchArtistAlbumTracks.album.name,
          year: searchArtistAlbumTracks.album.year,
          thumbnail: searchArtistAlbumTracks.album.thumbnail,
          artistId:frozenArtist.id,
          songs
        }}, update: (cache, data)=> { 
          const artist = {
            ...frozenArtist
          }  
          const result = cache.readQuery<GetArtistsQuery>({query: GetArtistsDocument})
          const newAlbum = data.data?.CreateAlbum!
          const queryArtists = [...result!.artists!.content!] 
          const otherArtists = queryArtists.filter( it => it?.name !== searchArtist!.name)
          const albums = [...artist.albums!]
          artist.albums = [...albums!, newAlbum ] 
          setDashboardArtist(frozenArtist)
          setDashboardAlbum(newAlbum)
          cache.writeQuery<GetArtistsQuery>({ query: GetArtistsDocument, data : { artists : { total: (result?.artists.total)|| 0, pageNumber: result?.artists.pageNumber || 0,  content: [...otherArtists, artist]} }    })
        }
      })
     }

      const artist = artistsFull.data?.artists?.content?.find(it => it?.name === searchArtistAlbumTracks.artist.name)   
      if (!artist) {
        createArtist({
          variables: {
            artistInput: {
              name: searchArtistAlbumTracks.artist.name, 
              thumbnail: searchArtistAlbumTracks.artist.thumbnail
            }
          }, update:  (cache, data) => {
             const artist = data.data?.CreateArtist
             doCreateAlbum(artist)
          }
        })
      } else {
        doCreateAlbum(artist)
      }
      setSearchArtistAlbumTracks(undefined)
    }},
  [searchArtistAlbumTracks])




  const updateDashboardAlbum = (album:Album|undefined, artist:Artist|undefined) => {
    setDashboardAlbum(album)
    setDashboardArtist(artist)
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
        </div>
        <div className="empty-cell"></div> 
        <Search onAlbumSelect={onExternalAlbumSearchClick}/>
        <RaterWrapper
          artists={artistsFull.data?.artists.content as Artist[]}
          selectedAlbumId={dashboardAlbum?.id}
          selectedArtistId={dashboardArtist?.id}
          state={raterState}
          setState={setRaterState}
        />
        <Dashboard 
          selectedArtistId={dashboardArtist?.id} 
          selectedAlbumId={dashboardAlbum?.id} 
          onAlbumSelect={updateDashboardAlbum} 
          artists={artistsFull.data?.artists?.content as Artist[]}
        />
      </div>
    </div>
  );
}

export default App;
