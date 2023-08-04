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
import { RaterAction, raterReducer } from './reducers/raterReducer';
import { client } from './setupApollo';
import { Reference } from '@apollo/client/cache';
import { Search } from './components/floats/search/Search';
import { MusicNavigationPanel } from './components/panels/musicnavigation/MusicNavigation';
import { MusicStore } from './music/MusicStore';
import { MusicZoomLevel, MusicState } from './music/MusicState';
import { ScorecardPanel } from './components/panels/BlockRaterPanel';
import { RaterZoomLevelControl } from './components/floats/RaterZoomLevelControl';
import { ComparisonRaterType } from './components/rater/comparison-rater/ComparisonRater';
import { MusicAction } from './music/MusicAction';
import { FilterMode } from './music/MusicFilters';

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

  const  [filterAwaitingLoad, setFilterAwaitingLoad] = useState<boolean>(false) 

  const [filterMode, setFilterMode] = useState<boolean>(false)
  const [itemsToFilter, setItemsToFilter] = useState<Array<string>>([])

  const [$loadAlbumsWithoutSongs, $albumsWithoutSongs]  = useAlbumsWithoutSongsLazyQuery() 
  const [$loadSongs, $songs]  = useAlbumSongsLazyQuery() 

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
    if (filterMode) {
      setItemsToFilter(items => [artist.id, ...itemsToFilter])
    } else {
      const store = new MusicStore(musicState) 
      if (!store.hasArtistLoadedAlbums(artist)) {
        $loadAlbumsWithoutSongs({variables: { artistIds: [artist.id] }})
        setFilterAwaitingLoad(true)
      }
      musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[artist.id]  }, zoomLevel: MusicZoomLevel.ALBUM})
    }
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
        if (filterAwaitingLoad) {
          musicDispatch({ type: 'FILTER_CHANGE', filters: { albumIds: albums.map(it => it.id) }})
        }
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
        setFilterAwaitingLoad(false)
      }
    }
  }, [$albumsWithoutSongs.loading, $albumsWithoutSongs.data, musicDispatch, filterAwaitingLoad])

  const addAlbum = (album:Album) => {
    const store = new MusicStore(musicState) 
    const zoomLevel = store.zoomLevel; 
    switch (zoomLevel) {
      case MusicZoomLevel.ARTIST: {
        onAlbumSelect(album)
        break;
      }
      case MusicZoomLevel.ALBUM: {
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds:[album.artistId], albumIds: [album.id] }, mode: FilterMode.ADDITIVE } )
        break;
      }
      case MusicZoomLevel.SONG: {
        if (!store.hasAlbumLoadedSongs(album)) {
          $loadSongs({ variables: { albumIds : [album.id] }  })
        }
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds:[album.artistId], albumIds: [album.id]} , mode: FilterMode.ADDITIVE })
      }
    }
  }
  const addArtist = (artist:Artist) => {
    const store = new MusicStore(musicState) 
    const zoomLevel = store.zoomLevel; 
    switch(zoomLevel) {
      // switch to the artist and show all their albums
      case MusicZoomLevel.ARTIST: {
        if (!store.hasArtistLoadedAlbums(artist)) {
          $loadAlbumsWithoutSongs({ variables: { artistIds: [artist.id] }})
        }
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] } } )
        break;
      }
      // load all albums (without songs) and add it to the current rater view   
      case MusicZoomLevel.ALBUM: {
        if (!store.hasArtistLoadedAlbums(artist)) {
          $loadAlbumsWithoutSongs({ variables: { artistIds: [artist.id] }})
        }
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] }, mode:FilterMode.ADDITIVE  } )
        break;
      }
      // load all songs for artist and add it to the current rater view  
      case MusicZoomLevel.SONG: {
        if (!store.hasArtistLoadedAlbums(artist)) {
          $loadArtistWithAlbumsAndSongs({variables: {artistName :artist.name}})
        }
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] }, mode:FilterMode.ADDITIVE  } )
      }
    }
  }


  useEffect(() => {
    switch(musicState.zoomLevel) {
      case MusicZoomLevel.ARTIST: { break;} 
      case MusicZoomLevel.ALBUM: {  
        const store = new MusicStore(musicState) 
        const artistIds  = store.getLazyArtists().map(it => it.id) 
        if (artistIds.length) {
          $loadAlbumsWithoutSongs({variables :  { artistIds } })
        }
        break;
      }
      case MusicZoomLevel.SONG: {
        const store = new MusicStore(musicState) 
        const albumIds =  store.getLazyAlbums().map(it => it.id) 
        if (albumIds.length) {
          $loadSongs({ variables: { albumIds } })
        }
        break;
      }
    }
  }, [musicState.zoomLevel, $loadAlbumsWithoutSongs,$loadSongs, musicState])

  const onAlbumSelect = (album:Album) => {
    if (filterMode) {
      setItemsToFilter(items => [album.id, ...itemsToFilter])
    } else {
      if (album.songs.length === 0) {
        $loadSongs({variables: { albumIds: [album.id] }})
      }
      musicDispatch({type: 'FILTER_CHANGE', filters: { albumIds:[album.id] }, zoomLevel: MusicZoomLevel.SONG })
    }
  }

  useEffect(() => {
    if (!$songs.loading && $songs.data) {
      const songArr = $songs.data.songs
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
    musicDispatch({ type: 'FILTER_CHANGE', zoomLevel  })
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

      const songs = $artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs] as Artist[], albums: $artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs?.albums as Album[], songs     }})
      const newAlbum = $artistWithAlbumsAndSongs.data.artistWithAlbumsAndSongs?.albums?.find(it => it?.name === searchAlbum?.name )
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

  const goHome = () => {
    musicDispatch({ type : 'FILTER_CHANGE', filters: { artistIds:  musicState.data.artists.map(it => it.id ), albumIds:[], songIds:[], scoreFilter: { start: SCORE_START, end:SCORE_END}} , zoomLevel: MusicZoomLevel.ARTIST  })
  } 

  const applyFilters = (shouldApply:boolean) => {
    if (shouldApply) {
      if (musicState.zoomLevel === MusicZoomLevel.ALBUM) {
         musicDispatch({ type : 'FILTER_CHANGE', filters: { albumIds:  itemsToFilter }, zoomLevel: MusicZoomLevel.ALBUM   })
      } else {
         musicDispatch({ type : 'FILTER_CHANGE', filters: { artistIds:  itemsToFilter }, zoomLevel: MusicZoomLevel.ARTIST  })
      }
    } 
    setFilterMode(false)
    setItemsToFilter([])
  }


  const store = new MusicStore(musicState)
  return (
    <div className={"App " + ((filterMode)?"filterMode":"")} >
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
        <div id="controls">
          <button id="home-button" onClick={goHome}>HOME</button>  
          <button id="filter-button" onClick={() => setFilterMode(true)}>FILTER</button>  
          { filterMode && <React.Fragment><button onClick={() => applyFilters(true)}>APPLY</button><button onClick={()=> applyFilters(false)} >CANCEL</button></React.Fragment>}
        </div>
        <RaterZoomLevelControl onZoomChange={handleOnZoomChange} value={musicState.zoomLevel} ></RaterZoomLevelControl>
        <div id="rater" className="viz drop-target" ref={drop}>
          <RaterWrapper
          filterMode={filterMode}
          itemsToFilter={itemsToFilter}
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
