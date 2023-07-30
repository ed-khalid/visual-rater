import React, { Dispatch, useEffect, useReducer, useState } from 'react';
import './App.css';
import { Scaler } from './functions/scale';
import {  ExternalAlbumSearchResult, Artist, ExternalArtistSearchResult, NewSongInput, useCreateAlbumMutation, useGetTracksForSearchAlbumLazyQuery, Song, Album, useOnArtistMetadataUpdateSubscription, AlbumFieldsFragmentDoc, SongFieldsFragmentDoc, useArtistWithAlbumsAndSongsLazyQuery, useArtistsWithoutAlbumsPageQuery, useAlbumsWithoutSongsLazyQuery, useAlbumSongsLazyQuery } from './generated/graphql';
import { ExternalFullSearchResult } from './models/domain/ExternalFullSearchResult';
import { RaterWrapper } from './components/rater/RaterWrapper';
import { DragType } from './models/ui/DragType';
import { useDrop } from 'react-dnd';
import { RaterState } from './models/ui/RaterTypes';
import { ArtistPanel } from './components/panels/ArtistPanel';
import { BreadcrumbEntry, Breadcrumb } from './components/floats/Breadcrumb';
import { RaterAction, raterReducer } from './reducers/raterReducer';
import { FilterMode, MusicAction } from './reducers/musicReducer';
import { client } from './setupApollo';
import { Reference } from '@apollo/client/cache';
import { Search } from './components/floats/search/Search';
import { BreadcrumbBuilder } from './functions/breadcrumb.builder';
import { MusicNavigationPanel } from './components/panels/musicnavigation/MusicNavigation';
import { MusicStore } from './music/MusicStore';
import { MusicZoomLevel, MusicState } from './music/MusicState';
import { ScorecardPanel } from './components/panels/BlockRaterPanel';
import { RaterZoomLevelControl } from './components/floats/RaterZoomLevelControl';
import { ComparisonRaterType } from './components/rater/comparison-rater/ComparisonRater';

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
  const $artistsPage  =  useArtistsWithoutAlbumsPageQuery()
  const [firstLoad, setFirstLoad] = useState<boolean>(true) 
  const [searchAlbum, setSearchAlbum] = useState<ExternalAlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult>()
  const [comparisonRaterOptions, setComparisonRaterOptions] = useState<Map<ComparisonRaterType, boolean>>(new Map([[ComparisonRaterType.OTHER_ARTISTS, true], [ComparisonRaterType.SAME_ARTIST, true], [ComparisonRaterType.WHATS_ON_RATER, false]])) 
  const [ $loadArtistWithAlbumsAndSongs, $artistWithAlbumsAndSongs ] = useArtistWithAlbumsAndSongsLazyQuery()
  useOnArtistMetadataUpdateSubscription() 

  const [$getSearchAlbumTracks, $searchAlbumTracks ] = useGetTracksForSearchAlbumLazyQuery()
  const [createAlbum, ] = useCreateAlbumMutation() 

  const [$loadAlbumsWithoutSongs, $albumsWithoutSongs]  = useAlbumsWithoutSongsLazyQuery() 
  const [$loadSongs, $songs]  = useAlbumSongsLazyQuery() 

  // breadcrumbs 
  const [breadcrumbs, setBreadcrumbs] = useState<Array<BreadcrumbEntry>>([{ title: 'HOME' , action: () => { setBreadcrumbs(breadcrumbs => ([breadcrumbs[0]])); 
    musicDispatch({type: 'ZOOM_LEVEL_CHANGE', zoomLevel: MusicZoomLevel.ALL }) 
    musicDispatch({type: 'FILTER_CHANGE', filters: { artistIds:musicState.data.artists.map(it => it.id) } })
  }}]) 
  // rater 
  const [raterState, raterDispatch] = useReducer<React.Reducer<RaterState,RaterAction>>(raterReducer, initialRaterState )

  useEffect(() => {
  if (!$artistsPage.loading && $artistsPage.data) {
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: $artistsPage.data.artistsWithoutAlbumsPage.content as Artist[]   }})
      if (firstLoad) {
          musicDispatch({type: 'FILTER_CHANGE', filters: { artistIds: $artistsPage.data.artistsWithoutAlbumsPage.content.map(it => it!.id) } }) 
          setFirstLoad(false)
      }
  }
  }, [$artistsPage.loading, $artistsPage.data, musicDispatch, firstLoad])

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


  const onArtistSelect = (artist:Artist) => {
      const artistBreadcrumb = BreadcrumbBuilder.buildArtistBreadcrumb(artist,musicDispatch, setBreadcrumbs) 
      setBreadcrumbs(breadcrumbs => [breadcrumbs[0], artistBreadcrumb ])
      $loadAlbumsWithoutSongs({variables: { artistIds: [artist.id] }})
      musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[artist.id]  }})
      musicDispatch({ type: 'ZOOM_LEVEL_CHANGE', zoomLevel: MusicZoomLevel.ALBUM })
  }

  const onMusicNavArtistExpand = (artist:Artist) => {
      const store = new MusicStore(musicState) 
      if (!store.hasArtistLoadedAlbums(artist)) {
        $loadAlbumsWithoutSongs({variables: { artistIds: [artist.id] }})
      } 
  }  

  useEffect(() => {
    if (!$albumsWithoutSongs.loading && $albumsWithoutSongs.data) {
      const albums = $albumsWithoutSongs.data.albumsWithoutSongs
      if (albums && albums.length) {
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
        musicDispatch({ type: 'FILTER_CHANGE', filters: { albumIds: albums.map(it => it.id) }, mode:FilterMode.ADDITIVE })
      }
    }
  }, [$albumsWithoutSongs.loading, $albumsWithoutSongs.data, musicDispatch])

  const addAlbum = (album:Album) => {
    const store = new MusicStore(musicState) 
    const zoomLevel = store.zoomLevel; 
    switch (zoomLevel) {
      case MusicZoomLevel.ALL: 
      case MusicZoomLevel.ARTIST: {
        onAlbumSelect(album)
        break;
      }
      case MusicZoomLevel.ALBUM: {
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds:[album.artistId], albumIds: [album.id] }, mode: FilterMode.ADDITIVE } )
        setBreadcrumbs(breadcrumbs => [breadcrumbs[0], BreadcrumbBuilder.buildMixedBreadcrumb()] )
        break;
      }
      case MusicZoomLevel.SONG: {
        $loadSongs({ variables: { albumIds : [album.id] }  })
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds:[album.artistId], albumIds: [album.id]} , mode: FilterMode.ADDITIVE })
        setBreadcrumbs(breadcrumbs => [breadcrumbs[0], BreadcrumbBuilder.buildMixedBreadcrumb()] )
      }
    }
  }
  const addArtist = (artist:Artist) => {
    const store = new MusicStore(musicState) 
    const zoomLevel = store.zoomLevel; 
    switch(zoomLevel) {
      // switch to the artist and show all their albums
      case MusicZoomLevel.ALL: 
      case MusicZoomLevel.ARTIST: {
        if (!store.hasArtistLoadedAlbums(artist)) {
          $loadAlbumsWithoutSongs({ variables: { artistIds: [artist.id] }})
        }
        setBreadcrumbs(breadcrumbs => [breadcrumbs[0], BreadcrumbBuilder.buildArtistBreadcrumb(artist, musicDispatch, setBreadcrumbs)]) 
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] } } )
        break;
      }
      // load all albums (without songs) and add it to the current rater view   
      case MusicZoomLevel.ALBUM: {
        if (!store.hasArtistLoadedAlbums(artist)) {
          $loadAlbumsWithoutSongs({ variables: { artistIds: [artist.id] }})
        }
        setBreadcrumbs(breadcrumbs => [breadcrumbs[0], BreadcrumbBuilder.buildMixedBreadcrumb()]) 
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] }, mode:FilterMode.ADDITIVE  } )
        break;
      }
      // load all songs for artist and add it to the current rater view  
      case MusicZoomLevel.SONG: {
        $loadArtistWithAlbumsAndSongs({variables: {artistName :artist.name}})
        setBreadcrumbs(breadcrumbs => [breadcrumbs[0], BreadcrumbBuilder.buildMixedBreadcrumb()]) 
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] }, mode:FilterMode.ADDITIVE  } )
      }
    }
  }


  useEffect(() => {
    switch(musicState.zoomLevel) {
      case MusicZoomLevel.ALL:
      case MusicZoomLevel.ARTIST: { break;} 
      case MusicZoomLevel.ALBUM: {  
        const store = new MusicStore(musicState) 
        const artistIds  = store.getLazyArtists().map(it => it.id) 
        $loadAlbumsWithoutSongs({variables :  { artistIds } })
        break;
      }
      case MusicZoomLevel.SONG: {
        const store = new MusicStore(musicState) 
        const albumIds =  store.getLazyAlbums().map(it => it.id) 
        $loadSongs({ variables: { albumIds } })
        break;
      }
    }
  }, [musicState.zoomLevel, $loadAlbumsWithoutSongs,$loadSongs, musicState])

  const onAlbumSelect = (album:Album) => {
    const albumBreadcrumb = BreadcrumbBuilder.buildAlbumBreadcrumb(album)
    const store = new MusicStore(musicState)
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
      $loadSongs({variables: { albumIds: [album.id] }})
    }
    musicDispatch({type: 'FILTER_CHANGE', filters: { artistIds:[album.artistId], albumIds:[album.id] } })
    musicDispatch({type: 'ZOOM_LEVEL_CHANGE', zoomLevel: MusicZoomLevel.SONG })
  }
  useEffect(() => {
    if (!$songs.loading && $songs.data) {
      const songArr = $songs.data.songs
      console.log(songArr)
      if (songArr) {
        songArr.forEach(songs => {
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
          }
        })
        const allSongs = songArr.reduce<Song[]>((acc,curr) => {  
          if(curr) return [...acc, ...curr] 
          else return acc }, [])
        musicDispatch({ type: 'DATA_CHANGE', data: { songs: allSongs as Song[]} })
      }
    }
  }, [$songs.loading, $songs.data, musicDispatch])

  const onArtistPanelSongsClick = (artist:Artist, scoreFilter:{start:number,end:number}) => {
    musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds: [artist.id], albumIds:[], scoreFilter: scoreFilter }  })
  }  

  const handleOnZoomChange = (zoomLevel:MusicZoomLevel) => {
    musicDispatch({ type: 'ZOOM_LEVEL_CHANGE', zoomLevel  })
  } 



  const onExternalAlbumSearchClick =  (artist:ExternalArtistSearchResult, album:ExternalAlbumSearchResult) => {
    setSearchArtist(artist)
    setSearchAlbum(album)
  }
  useEffect(() => {
    if (searchAlbum) {
      $getSearchAlbumTracks({ variables: { albumId: searchAlbum.id} })
    }
  }, [searchAlbum, $getSearchAlbumTracks])

  useEffect(() => {
    if ($searchAlbumTracks.data?.searchExternalAlbumTracks && searchArtist && searchAlbum) {
      const searchArtistAlbumTracks:ExternalFullSearchResult =  {
        artist: searchArtist,
        album: searchAlbum,
        tracks: $searchAlbumTracks.data?.searchExternalAlbumTracks 
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
            $loadArtistWithAlbumsAndSongs({ variables: { artistName: searchArtistAlbumTracks.artist.name }})
        } 
      }, )
    }
  }, [$searchAlbumTracks.data?.searchExternalAlbumTracks, searchArtist, searchAlbum, createAlbum, $loadArtistWithAlbumsAndSongs ] )

  useEffect(() => {
    if (!$artistWithAlbumsAndSongs.loading && $artistWithAlbumsAndSongs.data && searchAlbum) {

      const artistBreadcrumb = BreadcrumbBuilder.buildArtistBreadcrumb($artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs as Artist, musicDispatch, setBreadcrumbs) 

      const songs = $artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs] as Artist[], albums: $artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs?.albums as Album[], songs     }})
      const newAlbum = $artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs?.albums?.find(it => it?.name === searchAlbum?.name )
      const albumBreadcrumb = BreadcrumbBuilder.buildAlbumBreadcrumb(newAlbum as Album) 
      setBreadcrumbs(breadcrumbs => [breadcrumbs[0], artistBreadcrumb, albumBreadcrumb])
      if (newAlbum) {
        musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[$artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs!.id] , albumIds: [newAlbum.id] } })
      }
      setSearchArtist(undefined)
      setSearchAlbum(undefined)
      // just loading an artist without search
    } else if (!$artistWithAlbumsAndSongs.loading && $artistWithAlbumsAndSongs.data && !searchAlbum) {
      const songs = $artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs] as Artist[], albums: $artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs?.albums as Album[], songs     }})
      const albumIds = $artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs?.albums!.map(it => it!.id)  
      const songIds = songs?.map(it => it.id)  
      if (albumIds && songIds) {
        musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[$artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs!.id] , albumIds, songIds }, mode:FilterMode.ADDITIVE })
      }
    }
  }, [$artistWithAlbumsAndSongs.loading, $artistWithAlbumsAndSongs.data, searchAlbum, musicDispatch])



  const store = new MusicStore(musicState)
  return (
    <div className="App">
        <div id="left-sidebar" className="sidebar">
           <Search onExternalAlbumSelect={onExternalAlbumSearchClick} />
           <ScorecardPanel musicState={musicState} musicDispatch={musicDispatch} /> 
        </div>
        <div id="right-sidebar" className="sidebar">
          {store.data.artists && <MusicNavigationPanel 
              onArtistExpand={onMusicNavArtistExpand} 
              onArtistSwitch={onArtistSelect}
              onArtistAdd={addArtist}
              onAlbumSwitch={onAlbumSelect} 
              onAlbumAdd={addAlbum}
              state={musicState} 
              artists={store.data.artists} 
          />}
          {store.getSelectedArtists().length === 1 &&  store.getSelectedArtists().map(artist => <ArtistPanel onSongCategoryClick={onArtistPanelSongsClick} key={artist!.name+ '-panel'} artist={artist!}/>)}
        </div> 
        <Breadcrumb breadcrumbs={breadcrumbs}/>
        <RaterZoomLevelControl onZoomChange={handleOnZoomChange} value={musicState.zoomLevel} ></RaterZoomLevelControl>
        <div id="rater" className="viz drop-target" ref={drop}>
          <RaterWrapper
          comparisonRaterOptions={comparisonRaterOptions}
          onAlbumClick={onAlbumSelect}
          onArtistClick={onArtistSelect}
          musicDispatch={musicDispatch}
          state={raterState}
          musicState={musicState}
          stateDispatch={raterDispatch}
          />
        </div>
    </div>
  );
}

export default App;
