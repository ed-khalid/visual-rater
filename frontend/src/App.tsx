import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Scaler } from './functions/scale';
import {  ExternalAlbumSearchResult, Artist, ExternalArtistSearchResult, GetArtistsDocument, GetArtistsQuery, NewSongInput, useCreateAlbumMutation, useCreateArtistMutation, useGetArtistsQuery , useGetTracksForSearchAlbumQuery, useGetTracksForSearchAlbumLazyQuery, Song, Album } from './generated/graphql';
import { zoomIdentity } from 'd3-zoom'
import { Search } from './components/search/Search';
import { ItemType } from './models/domain/ItemTypes';
import { ExternalFullSearchResult } from './models/domain/ExternalFullSearchResult';
import { RaterWrapper, RaterWrapperMode } from './components/rater/RaterWrapper';
import { DragType } from './models/ui/DragType';
import { useDrop } from 'react-dnd';
import { GlobalRaterState } from './models/ui/RaterTypes';
import { ArtistsPanel } from './components/panels/ArtistsPanel';
import { ArtistAlbumsPanel } from './components/panels/ArtistAlbumsPanel';
import { AlbumPanel } from './components/panels/AlbumPanel';



export const initialRaterState:GlobalRaterState = {
   start: 0
  ,end: 5
  ,isReadonly: true
  ,scaler : new Scaler() 
  ,itemType: ItemType.MUSIC
} 

export const App = () => {

  const [searchAlbum, setSearchAlbum] = useState<ExternalAlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult>()
  const [searchArtistAlbumTracks, setSearchArtistAlbumTracks] = useState<ExternalFullSearchResult>()

  const [getTracks, getTracksResult ] = useGetTracksForSearchAlbumLazyQuery()
  const [createAlbum, ] = useCreateAlbumMutation() 
  const [createArtist, ] = useCreateArtistMutation() 

  const artistsFull =  useGetArtistsQuery()

  // rater items
  const [selectedArtists, setSelectedArtists] = useState<Array<Artist>>([])
  const [selectedAlbums, setSelectedAlbums] = useState<Array<Album>>([])
  const [mode, setRaterWrapperMode] = useState<RaterWrapperMode>(RaterWrapperMode.ARTIST)
  const [raterItems, setRaterItems] = useState<Array<Artist>|Array<Album>>([])
  const [raterState, setRaterState] = useState<GlobalRaterState>(initialRaterState)

  const [, drop] = useDrop(() => ({
    accept: [DragType.ALBUM, DragType.ARTIST]
    ,drop(item:{album?:Album, artist?:Artist},_) {
      if (item.album) {
        onAlbumSelect(item.album, undefined)
      }
      if (item.artist) {
        onArtistSelect(item.artist)
      }
    }
  }), [raterItems])

  const onArtistSelect = (artist:Artist|undefined) => {
    if (artist) {
      const found = selectedArtists.find(it => it.id === artist.id) 
      if (found) {
        setSelectedArtists([artist])
      } else {
        setSelectedArtists([...selectedArtists, artist])
      }
    } else {
      setSelectedArtists([])
    }
  } 

  const onAlbumSelect = (album:Album|undefined, artist:Artist|undefined) => {
    if (album) {
      const found = selectedAlbums.find(it => it.id === album.id)
      if (found) {
        setSelectedAlbums([album])
      } else {
        setSelectedAlbums([...selectedAlbums, album])
      }
    } else {
      setRaterItems([])
    }
  }

  useEffect(() => {
    setRaterWrapperMode(RaterWrapperMode.ALBUM)
    setRaterItems(selectedAlbums)
  }, [selectedAlbums])

  useEffect(() => {
    setRaterWrapperMode(RaterWrapperMode.ARTIST)
    setRaterItems(selectedArtists)
  }, [selectedArtists])

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
          const otherArtists = queryArtists.filter( it => it?.name !== searchArtistAlbumTracks!.album.name)
          const albums = [...artist.albums!]
          artist.albums = [...albums!, newAlbum] 
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





  return (
    <div className="App">
      <div className="main">
        <div className='panel noborder top left' id="search">
          <Search onAlbumSelect={onExternalAlbumSearchClick}/>
        </div>
        <div id="top-controls" className="panel noborder top center">
          <div>
            <button onClick={onZoomResetClick}>Reset</button>
          </div>
        </div>

         <ArtistsPanel artists={artistsFull.data?.artists.content as Artist[]} onArtistSelect={onArtistSelect} ></ArtistsPanel>
        {selectedArtists.map(artist => <ArtistAlbumsPanel key={artist.id} artist={artist} onAlbumSelect={onAlbumSelect} />)}
        {selectedAlbums.map(album => <AlbumPanel key={album.id} album={album} artistName={undefined} onClose={() => {}}  />)}
        <div id="rater" className="viz drop-target" ref={drop}>
          <RaterWrapper
          artists={artistsFull.data?.artists.content as Artist[]}
          onAlbumClick={onAlbumSelect}
          mode={mode}
          items={raterItems}
          state={raterState}
          setState={setRaterState}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
