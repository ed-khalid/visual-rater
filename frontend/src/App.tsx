import React, { Dispatch, useEffect, useReducer, useState } from 'react';
import './App.css';
import { Scaler } from './functions/scale';
import {  ExternalAlbumSearchResult, Artist, ExternalArtistSearchResult, NewSongInput, useCreateAlbumMutation, useGetArtistsQuery , useGetTracksForSearchAlbumLazyQuery, Song, Album, useOnArtistMetadataUpdateSubscription, useGetAlbumsLazyQuery, useGetSongsLazyQuery, AlbumFieldsFragmentDoc, SongFieldsFragmentDoc, GetAlbumsQuery, GetAlbumsDocument, useGetSingleArtistLazyQuery } from './generated/graphql';
import { ExternalFullSearchResult } from './models/domain/ExternalFullSearchResult';
import { RaterWrapper } from './components/rater/RaterWrapper';
import { DragType } from './models/ui/DragType';
import { useDrop } from 'react-dnd';
import { RaterState } from './models/ui/RaterTypes';
import { ArtistPanel } from './components/panels/ArtistPanel';
import { AlbumPanel } from './components/panels/AlbumPanel';
import { Breadcrumb, BreadcrumbPanel } from './components/panels/BreadcrumbPanel';
import { RaterAction, raterReducer } from './reducers/raterReducer';
import { MusicData, MusicFilters, MusicScope, MusicState, MusicStore } from './models/domain/MusicState';
import { FilterMode, MusicAction } from './reducers/musicReducer';
import { client } from './setupApollo';
import { Reference } from '@apollo/client/cache';
import { SearchPanel } from './components/panels/search/SearchPanel';
import { BreadcrumbBuilder } from './functions/breadcrumb.builder';
import { MusicNavigationPanel } from './components/panels/musicnavigation/MusicNavigation';

export const initialRaterState:RaterState = {
   start: 0
  ,end: 5
  ,isReadonly: true
  ,scaler : new Scaler() 
} 

interface Props {
  musicState:MusicState 
  musicDispatch:Dispatch<MusicAction>
}

export const App = ({musicState, musicDispatch}:Props) => {

  // search
  const [searchAlbum, setSearchAlbum] = useState<ExternalAlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult>()
  const [ $getSingleArtist, $singleArtist ] = useGetSingleArtistLazyQuery()
  useOnArtistMetadataUpdateSubscription() 

  const [getTracks, getTracksResult ] = useGetTracksForSearchAlbumLazyQuery()
  const [createAlbum, ] = useCreateAlbumMutation() 

  // main data 
  const $artists  =  useGetArtistsQuery()
  const [$getAlbums, $albums]  = useGetAlbumsLazyQuery() 
  const [$getSongs, $songs]  = useGetSongsLazyQuery() 

  // breadcrumbs 
  const [breadcrumbs, setBreadcrumbs] = useState<Array<Breadcrumb>>([{ title: 'ARTISTS' , action: () => { setBreadcrumbs(breadcrumbs => ([breadcrumbs[0]])); musicDispatch({type: 'FILTER_CHANGE', filters: { artistIds:[], albumIds:[], songIds:[], scoreFilter: { start:0, end:5 } } }  )}}]) 
  // rater 
  const [raterState, raterDispatch] = useReducer<React.Reducer<RaterState,RaterAction>>(raterReducer, initialRaterState )


  const [, drop] = useDrop(() => ({
    accept: [DragType.ALBUM, DragType.ARTIST]
    ,drop(item:{album?:Album, artist?:Artist},_) {
      if (item.album) {
        addAlbum(item.album)
      }
      else if (item.artist) {
        addArtist(item.artist)
      }
    }
  }), [musicState])

  useEffect(()  => {
    if (!$artists.loading && $artists.data) {
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: $artists.data.artists.content as Artist[]   }})
    }
  }, [$artists.loading, $artists.data, musicDispatch] )

  const onArtistSelect = (artist:Artist) => {
      const artistBreadcrumb = BreadcrumbBuilder.buildArtistBreadcrumb(artist,musicDispatch, setBreadcrumbs) 
      setBreadcrumbs(breadcrumbs => [breadcrumbs[0], artistBreadcrumb ])
      $getAlbums({variables: { artistId: artist.id }})
      musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[artist.id]  }})
  }

  const onMusicNavArtistExpand = (artist:Artist) => {
    console.log(musicState.data)
      const store = new MusicStore(musicState.data, new MusicFilters(musicState.filters)) 
      if (!store.hasArtistLoadedAlbums(artist)) {
        $getAlbums({variables: { artistId: artist.id }})
      } 
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
        musicDispatch({ type: 'DATA_CHANGE', data: { albums: albums as Album[]}   })
      }
    }
  }, [$albums.loading, $albums.data, musicDispatch])

  const addAlbum = (album:Album) => {
    const store = new MusicStore(musicState.data, new MusicFilters(musicState.filters)) 
    const scope = store.getScope(); 
    switch (scope) {
      case MusicScope.ARTIST: {
        onAlbumSelect(album)
        break;
      }
      case MusicScope.ALBUM: {
        musicDispatch({type:'FILTER_CHANGE', filters: { albumIds: [album.id] }, mode: FilterMode.ADDITIVE } )
        setBreadcrumbs(breadcrumbs => [breadcrumbs[0], BreadcrumbBuilder.buildMixedBreadcrumb()] )
        break;
      }
      case MusicScope.SONG: {
        $getSongs({ variables: { albumId : album.id }  })
        musicDispatch({type:'FILTER_CHANGE', filters: { albumIds: [album.id]} , mode: FilterMode.ADDITIVE })
        setBreadcrumbs(breadcrumbs => [breadcrumbs[0], BreadcrumbBuilder.buildMixedBreadcrumb()] )
      }
    }
  }
  const addArtist = (artist:Artist) => {
    const store = new MusicStore(musicState.data, new MusicFilters(musicState.filters)) 
    const scope = store.getScope(); 
    switch(scope) {
      // switch to the artist and show all their albums
      case MusicScope.ARTIST:  {
        if (!store.hasArtistLoadedAlbums(artist)) {
          $getAlbums({ variables: { artistId: artist.id }})
        }
        setBreadcrumbs(breadcrumbs => [breadcrumbs[0], BreadcrumbBuilder.buildArtistBreadcrumb(artist, musicDispatch, setBreadcrumbs)]) 
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] } } )
        break;
      }
      // load all albums (without songs) and add it to the current rater view   
      case MusicScope.ALBUM: {
        if (!store.hasArtistLoadedAlbums(artist)) {
          $getAlbums({ variables: { artistId: artist.id }})
        }
        setBreadcrumbs(breadcrumbs => [breadcrumbs[0], BreadcrumbBuilder.buildMixedBreadcrumb()]) 
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] }, mode:FilterMode.ADDITIVE  } )
        break;
      }
      // load all songs for artist and add it to the current rater view  
      case MusicScope.SONG: {
        $getSingleArtist({variables: {artistName :artist.name}})
        setBreadcrumbs(breadcrumbs => [breadcrumbs[0], BreadcrumbBuilder.buildMixedBreadcrumb()]) 
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] }, mode:FilterMode.ADDITIVE  } )
      }
    }
  }

  const onAlbumSelect = (album:Album) => {
    const albumBreadcrumb = BreadcrumbBuilder.buildAlbumBreadcrumb(album)
    const store = new MusicStore(musicState.data, new MusicFilters(musicState.filters))
    let artistBreadcrumb = breadcrumbs[1] 
    if (!artistBreadcrumb) {
      const artist = store.getArtistForAlbum(album)  
      if (artist) {
        artistBreadcrumb = BreadcrumbBuilder.buildArtistBreadcrumb(artist, musicDispatch, setBreadcrumbs) 
      } else {
        throw Error("Didn't find artist for album " + album.name ) 
      }
    }
    setBreadcrumbs(breadcrumbs => [breadcrumbs[0], artistBreadcrumb, albumBreadcrumb])
    if (album.songs.length === 0) {
      $getSongs({variables: { albumId: album.id }})
    }
    musicDispatch({type: 'FILTER_CHANGE', filters: { artistIds:[album.artistId], albumIds:[album.id] } })
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

        musicDispatch({ type: 'DATA_CHANGE', data: { songs: songs as Song[]} })
      }
    }
  }, [$songs.loading, $songs.data, musicDispatch])

  const onArtistPanelSongsClick = (artist:Artist, scoreFilter:{start:number,end:number}) => {
    musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds: [artist.id], albumIds:[], scoreFilter: scoreFilter }  })
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
      const searchArtistAlbumTracks:ExternalFullSearchResult =  {
        artist: searchArtist,
        album: searchAlbum,
        tracks: getTracksResult.data?.searchExternalAlbumTracks 
      }
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
          vendorId: searchArtistAlbumTracks.album.id,
          thumbnail: searchArtistAlbumTracks.album.thumbnail,
          artist: {
            name: searchArtistAlbumTracks.artist.name,
            thumbnail: searchArtistAlbumTracks.artist.thumbnail,
            vendorId: searchArtistAlbumTracks.artist.id 
          }, 
          songs
        }},  update: () => {
            $getSingleArtist({ variables: { artistName: searchArtistAlbumTracks.artist.name }})
        } 
      }, )
    }
  }, [getTracksResult.data?.searchExternalAlbumTracks, searchArtist, searchAlbum, createAlbum, $getSingleArtist ] )

  useEffect(() => {
    if (!$singleArtist.loading && $singleArtist.data && searchAlbum) {

      const artistBreadcrumb = BreadcrumbBuilder.buildArtistBreadcrumb($singleArtist.data.artist as Artist, musicDispatch, setBreadcrumbs) 

      const songs = $singleArtist.data.artist?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$singleArtist.data.artist] as Artist[], albums: $singleArtist.data.artist?.albums as Album[], songs     }})
      const newAlbum = $singleArtist.data.artist?.albums?.find(it => it?.name === searchAlbum?.name )
      const albumBreadcrumb = BreadcrumbBuilder.buildAlbumBreadcrumb(newAlbum as Album) 
      setBreadcrumbs(breadcrumbs => [breadcrumbs[0], artistBreadcrumb, albumBreadcrumb])
      if (newAlbum) {
        musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[$singleArtist.data.artist!.id] , albumIds: [newAlbum.id] } })
      }
      setSearchArtist(undefined)
      setSearchAlbum(undefined)
      // just loading an artist without search
    } else if (!$singleArtist.loading && $singleArtist.data && !searchAlbum) {
      const songs = $singleArtist.data.artist?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$singleArtist.data.artist] as Artist[], albums: $singleArtist.data.artist?.albums as Album[], songs     }})
      const albumIds = $singleArtist.data.artist?.albums!.map(it => it!.id)  
      const songIds = songs?.map(it => it.id)  
      if (albumIds && songIds) {
        musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[$singleArtist.data.artist!.id] , albumIds, songIds }, mode:FilterMode.ADDITIVE })
      }
    }
  }, [$singleArtist.loading, $singleArtist.data, searchAlbum, musicDispatch])



  const store = new MusicStore(new MusicData(musicState.data), new MusicFilters(musicState.filters))
  return (
    <div className="App">
        <div id="left-sidebar" className="sidebar">
           <SearchPanel onExternalAlbumSelect={onExternalAlbumSearchClick} />
        </div>
        <div id="right-sidebar" className="sidebar">
          {!$artists.loading && $artists.data && <MusicNavigationPanel onAlbumSelect={onAlbumSelect} onArtistExpand={onMusicNavArtistExpand} state={musicState} artists={$artists.data.artists.content as Artist[]} />}
          {store.getSelectedArtists().map(artist => <ArtistPanel onSongCategoryClick={onArtistPanelSongsClick} key={artist!.name+ '-panel'} artist={artist!}/>)}
          {store.getSelectedAlbums().map(album => <AlbumPanel key={album.name+'-panel'} album={album} onClose={() => {}}  />)}
        </div> 
        <BreadcrumbPanel breadcrumbs={breadcrumbs}/>
        {/* <div id="top-controls" className="panel">
          <div>
            <button onClick={onZoomResetClick}>Reset</button>
          </div>
        </div> */}
        <div id="rater" className="viz drop-target" ref={drop}>
          <RaterWrapper
          onAlbumClick={onAlbumSelect}
          onArtistClick={onArtistSelect}
          state={raterState}
          musicState={musicState}
          stateDispatch={raterDispatch}
          />
        </div>
    </div>
  );
}

export default App;
