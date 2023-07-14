import React, { useEffect, useState } from 'react';
import './App.css';
import { Scaler } from './functions/scale';
import {  ExternalAlbumSearchResult, Artist, ExternalArtistSearchResult, GetArtistsDocument, GetArtistsQuery, NewSongInput, useCreateAlbumMutation, useCreateArtistMutation, useGetArtistsQuery , useGetTracksForSearchAlbumQuery, useGetTracksForSearchAlbumLazyQuery, Song, Album, useOnArtistMetadataUpdateSubscription } from './generated/graphql';
import { zoomIdentity } from 'd3-zoom'
import { Search } from './components/legacy/search/Search';
import { ItemType } from './models/domain/ItemTypes';
import { ExternalFullSearchResult } from './models/domain/ExternalFullSearchResult';
import { RaterWrapper, RaterWrapperMode } from './components/rater/RaterWrapper';
import { DragType } from './models/ui/DragType';
import { useDrop } from 'react-dnd';
import { GlobalRaterState } from './models/ui/RaterTypes';
import { ArtistPanel } from './components/panels/ArtistPanel';
import { AlbumPanel } from './components/panels/AlbumPanel';
import { getAllSongs } from './functions/music';
import { Breadcrumb, BreadcrumbPanel } from './components/panels/BreadcrumbPanel';



export const initialRaterState:GlobalRaterState = {
   start: 0
  ,end: 5
  ,isReadonly: true
  ,mode: RaterWrapperMode.ARTIST
  ,scoreFilter: { start:0, end:5}
  ,selections: []
  ,scaler : new Scaler() 
  ,itemType: ItemType.MUSIC
} 

export const App = () => {


  //breadcrumbs

  // search
  const [searchAlbum, setSearchAlbum] = useState<ExternalAlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult>()
  const [searchArtistAlbumTracks, setSearchArtistAlbumTracks] = useState<ExternalFullSearchResult>()
  useOnArtistMetadataUpdateSubscription() 

  const [getTracks, getTracksResult ] = useGetTracksForSearchAlbumLazyQuery()
  const [createAlbum, ] = useCreateAlbumMutation() 
  const [createArtist, ] = useCreateArtistMutation() 

  // main data 
  const artistsFull =  useGetArtistsQuery()
  const [selectedArtists, setSelectedArtists] = useState<Array<Artist>>([])
  const [selectedAlbums, setSelectedAlbums] = useState<Array<Album>>([])

  // const 
  const [breadcrumbs, setBreadcrumbs] = useState<Array<Breadcrumb>>([{ title: 'ARTISTS' , action: () => setRaterState((state) => ({...state, mode: RaterWrapperMode.ARTIST  }) )  }]) 

  // rater 
  const [raterState, setRaterState] = useState<GlobalRaterState>(initialRaterState)

  const [, drop] = useDrop(() => ({
    accept: [DragType.ALBUM, DragType.ARTIST]
    ,drop(item:{album?:Album, artist?:Artist},_) {
      if (item.album) {
        onAlbumSelect([item.album], undefined)
      }
      if (item.artist) {
        onArtistSelect(item.artist)
      }
    }
  }), [])

  const onArtistPanelSongsClick = (artist:Artist, scoreFilter:{start:number,end:number}, mode:RaterWrapperMode ) => {
    const songIds = getAllSongs(artistsFull.data?.artists.content as Artist[]).filter(it => it.artist.id === artist.id).map(it => it.song.id)
    setRaterState(prev => ({ ...prev, mode, scoreFilter, selections:songIds  }))
  }  

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



  const onAlbumSelect = (albums:Array<Album>|undefined, artist:Artist|undefined) => {
    if (albums) {
      if (albums.length === 1) {
        const album = albums[0]
        const found = selectedAlbums.find(it => it.id === album.id)
        if (found) {
          setSelectedAlbums([album])
        } else {
          setSelectedAlbums([...selectedAlbums, album])
        }
      } else {
        setSelectedAlbums(albums)
      }
    } else {
      setRaterState(prev => ({...prev, selections: []}))
    }
  }

  useEffect(()  => {
    if (raterState.mode === RaterWrapperMode.ARTIST && artistsFull.data?.artists.content) {
      const artistIds = artistsFull.data.artists.content.map(it => it!.id) 
      setRaterState(prev => ({...prev, selections: artistIds}))
    }
  }, [artistsFull.data?.artists.content, raterState.mode] )

  useEffect(() => {
    if (selectedAlbums.length) {
      const songIds = selectedAlbums.reduce<Array<string>>((acc, curr) => {
        const ids = curr.songs.map(it => it.id)
        return [...acc, ...ids ]
      }, [])   
      if (selectedAlbums.length === 1) {
        setBreadcrumbs([breadcrumbs[0], breadcrumbs[1], { title: selectedAlbums[0].name, action: () => setSelectedAlbums([selectedAlbums[0]])      } ])
      }
      setRaterState(prev => ({...prev, mode: RaterWrapperMode.SONG, selections: songIds }) )
    }
  }, [selectedAlbums])

  useEffect(() => {
    if (selectedArtists.length) {
      const albumIds = selectedArtists.reduce<Array<string>>((acc, curr) => {
        const ids = curr.albums!.map(it => it!.id)
        return [...acc, ...ids ]
      }, [])   
      if (selectedArtists.length === 1) {
        setBreadcrumbs([breadcrumbs[0], { title: selectedArtists[0].name, action: () => setSelectedArtists([selectedArtists[0]])      } ])
      }
      setRaterState(prev => ({...prev, mode: RaterWrapperMode.ALBUM, selections:albumIds }) )
    }
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

  const onZoomResetClick = () => {
    const resetScale = zoomIdentity.rescaleY(raterState.scaler.yScale) 
    setRaterState(prev => ({...prev, scaler: new Scaler(resetScale)})) 
  }

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
        <BreadcrumbPanel breadcrumbs={breadcrumbs}/>
        {/* <div id="top-controls" className="panel">
          <div>
            <button onClick={onZoomResetClick}>Reset</button>
          </div>
        </div> */}
        {artistsFull.data?.artists.content.filter(artist => selectedArtists.map(it => it.id).includes(artist!.id) ).map(artist => <ArtistPanel onSongCategoryClick={onArtistPanelSongsClick} key={artist!.id} artist={artist!}/>)}
        {selectedAlbums.map(album => <AlbumPanel key={album.id} album={album} artistName={undefined} onClose={() => {}}  />)}
        <div id="rater" className="viz drop-target" ref={drop}>
          <RaterWrapper
          artists={artistsFull.data?.artists.content as Artist[]}
          onAlbumClick={onAlbumSelect}
          onArtistClick={onArtistSelect}
          state={raterState}
          setState={setRaterState}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
