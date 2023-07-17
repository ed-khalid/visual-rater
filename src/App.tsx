import React, { useEffect, useReducer, useState } from 'react';
import './App.css';
import { Scaler } from './functions/scale';
import {  ExternalAlbumSearchResult, Artist, ExternalArtistSearchResult, GetArtistsDocument, GetArtistsQuery, NewSongInput, useCreateAlbumMutation, useCreateArtistMutation, useGetArtistsQuery , useGetTracksForSearchAlbumLazyQuery, Song, Album, useOnArtistMetadataUpdateSubscription, useGetAlbumsLazyQuery, useGetSongsLazyQuery, AlbumFieldsFragmentDoc, SongFieldsFragmentDoc, GetAlbumsQuery, GetAlbumsDocument } from './generated/graphql';
import { Search } from './components/legacy/search/Search';
import { ExternalFullSearchResult } from './models/domain/ExternalFullSearchResult';
import { RaterWrapper } from './components/rater/RaterWrapper';
import { DragType } from './models/ui/DragType';
import { useDrop } from 'react-dnd';
import { RaterState } from './models/ui/RaterTypes';
import { ArtistPanel } from './components/panels/ArtistPanel';
import { AlbumPanel } from './components/panels/AlbumPanel';
import { Breadcrumb, BreadcrumbPanel } from './components/panels/BreadcrumbPanel';
import { RaterAction, raterReducer } from './reducers/raterReducer';
import { MusicData, MusicFilters, MusicState, MusicStore } from './models/domain/MusicState';
import { MusicAction, musicReducer } from './reducers/musicReducer';
import { client } from './setupApollo';
import { Reference } from '@apollo/client/cache';

export const initialRaterState:RaterState = {
   start: 0
  ,end: 5
  ,isReadonly: true
  ,scaler : new Scaler() 
} 

export const App = () => {


  // search
  const [searchAlbum, setSearchAlbum] = useState<ExternalAlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult>()
  const [searchArtistAlbumTracks, setSearchArtistAlbumTracks] = useState<ExternalFullSearchResult>()
  useOnArtistMetadataUpdateSubscription() 

  const [getTracks, getTracksResult ] = useGetTracksForSearchAlbumLazyQuery()
  const [createAlbum, ] = useCreateAlbumMutation() 
  const [createArtist, ] = useCreateArtistMutation() 

  // main data 
  const $artists  =  useGetArtistsQuery()
  const [$getAlbums, $albums]  = useGetAlbumsLazyQuery() 
  const [$getSongs, $songs]  = useGetSongsLazyQuery() 
  const [musicState, musicDispatch] = useReducer<React.Reducer<MusicState,MusicAction>>(musicReducer, { data: { artists: [], albums:[], songs:[] } , filters: { artistIds: [] , albumIds:[], songIds: [], scoreFilter:{start:0, end:5} }  })

  // breadcrumbs 
  const [breadcrumbs, setBreadcrumbs] = useState<Array<Breadcrumb>>([{ title: 'ARTISTS' , action: () => { setBreadcrumbs(breadcrumbs => ([breadcrumbs[0]])); musicDispatch({type: 'FILTER_CHANGE', variables: { filters: { artistIds:[], albumIds:[], songIds:[], scoreFilter: { start:0, end:5 } } }  })}}]) 

  // rater 
  const [raterState, dispatch] = useReducer<React.Reducer<RaterState,RaterAction>>(raterReducer, initialRaterState )


  const [, drop] = useDrop(() => ({
    accept: [DragType.ALBUM, DragType.ARTIST]
    ,drop(item:{album:Album, artist:Artist},_) {
      if (item.album) {
        addAlbum(item.album)
      }
      else if (item.artist) {
        addArtist(item.artist)
      }
    }
  }), [])

  useEffect(()  => {
    if (!$artists.loading && $artists.data) {
      musicDispatch({ type: 'DATA_CHANGE', variables: { data: { artists: $artists.data.artists.content as Artist[]   }}})
    }
  }, [$artists.loading, $artists.data] )

  const onArtistSelect = (artist:Artist) => {
      setBreadcrumbs(breadcrumbs => [breadcrumbs[0], { title: artist.name, action: () => { setBreadcrumbs((breadcrumbs) => ([breadcrumbs[0], breadcrumbs[1]])); musicDispatch({ type: 'FILTER_CHANGE', variables: { filters: {artistIds: [artist.id], albumIds:[], songIds:[], scoreFilter:{start:0, end:5}} }})}} ])
      $getAlbums({variables: { artistId: artist.id }})
      musicDispatch({ type: 'FILTER_CHANGE', variables: { filters: { artistIds:[artist.id]  }} })
  }
  useEffect(() => {
    if (!$albums.loading && $albums.data) {
      const albums = $albums.data.albums
      if (albums) {
        const artistId = albums[0].artistId 
        const cache = client.cache
        const refs = albums.map(it => client.writeFragment({ data: it, fragment: AlbumFieldsFragmentDoc, fragmentName: 'AlbumFields'}))
        cache.modify({
          id: `Artist:${artistId}`,
          fields: {
            albums(existing:Reference[], {readField} ) {
              const newRefs = refs.reduce<Reference[]>((acc,curr) => {
                if (!curr) {
                  return acc
                }
                else if (existing.some(it => readField('id',it) ===  readField('id', curr))) {
                  return acc
                } else {
                  return [...acc, curr]
                }
              }, [])
              return [...existing, ...newRefs ]
            }
          } 
        });
        musicDispatch({ type: 'DATA_CHANGE', variables: { data: { albums: albums as Album[]}  } })
      }
    }
  }, [$albums.loading, $albums.data])

  const addAlbum = (album:Album) => {
    musicDispatch({type:'FILTER_CHANGE', variables: { filters: { albumIds: [album.id] } }} )
  }
  const addArtist = (artist:Artist) => {
    musicDispatch({type:'FILTER_CHANGE', variables: { filters: { artistIds: [artist.id] } }} )
  }

  const onAlbumSelect = (album:Album) => {
    setBreadcrumbs(breadcrumbs => [breadcrumbs[0], breadcrumbs[1], { title: album.name, action: () => musicDispatch({ type: 'FILTER_CHANGE', variables: { filters: {albumIds: [album.id], songIds:[], scoreFilter:{start:0,end:5}} }})} ])
    $getSongs({variables: { albumId: album.id }})
    musicDispatch({type: 'FILTER_CHANGE', variables: { filters: { albumIds:[album.id] } }})
  }
  useEffect(() => {
    if (!$songs.loading && $songs.data) {
      const songs = $songs.data.songs
      if (songs) {
        const albumId = songs[0].albumId 
        const refs = songs.map(song => client.writeFragment({ data: song, fragment: SongFieldsFragmentDoc}))
        client.cache.modify({
          id: `Album:${albumId}`,
          fields: {
            songs(existing:Reference[], {readField} ) {
              const newRefs = refs.reduce<Reference[]>((acc,curr) => {
                if (!curr) {
                  return acc
                }
                else if (existing.some(it => readField('id',it) ===  readField('id', curr))) {
                  return acc
                } else {
                  return [...acc, curr]
                }
              }, [])
              return [...existing, ...newRefs ]
            }
          } 
        });

        musicDispatch({ type: 'DATA_CHANGE', variables: { data: { songs: songs as Song[]} }})
      }
    }
  }, [$songs.loading, $songs.data])

  const onArtistPanelSongsClick = (artist:Artist, scoreFilter:{start:number,end:number}) => {
    musicDispatch({ type: 'FILTER_CHANGE', variables: { filters: { artistIds: [artist.id], albumIds:[], scoreFilter: scoreFilter }  }})
  }  



  const onExternalAlbumSearchClick =  (artist:ExternalArtistSearchResult, album:ExternalAlbumSearchResult) => {
    setSearchArtist(artist)
    setSearchAlbum(album)
  }
  useEffect(() => {
    if (searchAlbum) {
      getTracks({ variables: { albumId: searchAlbum.id} })
    }
  }, [searchAlbum, getTracks])

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

      const artist = $artists.data?.artists?.content?.find(it => it?.name === searchArtistAlbumTracks.artist.name)   
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

  const store = new MusicStore(new MusicData(musicState.data), new MusicFilters(musicState.filters))


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
        {store.getSelectedArtists().map(artist => <ArtistPanel onSongCategoryClick={onArtistPanelSongsClick} key={artist!.name+ '-panel'} artist={artist!}/>)}
        {store.getSelectedAlbums().map(album => <AlbumPanel key={album.name+'-panel'} album={album} onClose={() => {}}  />)}
        <div id="rater" className="viz drop-target" ref={drop}>
          <RaterWrapper
          onAlbumClick={onAlbumSelect}
          onArtistClick={onArtistSelect}
          state={raterState}
          musicState={musicState}
          stateDispatch={dispatch}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
