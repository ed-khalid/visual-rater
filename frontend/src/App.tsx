import React, { Dispatch, useEffect, useReducer, useState } from 'react';
import './App.css';
import { Scaler } from './functions/scale';
import {  ExternalAlbumSearchResult, Artist, ExternalArtistSearchResult, NewSongInput, useCreateAlbumMutation, useGetTracksForSearchAlbumLazyQuery, Song, Album, useOnAlbumUpdateSubscription, useOnArtistUpdateSubscription, useGetArtistsPageQuery, useGetAlbumsSongsLazyQuery, useGetAlbumsLazyQuery, useGetArtistFullLazyQuery } from './generated/graphql';
import { ExternalFullSearchResult } from './models/ExternalFullSearchResult';
import { RaterWrapper } from './components/rater/RaterWrapper';
import { DragType } from './models/DragType';
import { useDrop } from 'react-dnd';
import { RaterState } from './models/RaterTypes';
import { ArtistPanel } from './components/panels/ArtistPanel';
import { RaterAction, raterReducer } from './reducers/raterReducer';
import { Search } from './components/floats/search/Search';
import { MusicNavigationPanel } from './components/panels/musicnavigation/MusicNavigation';
import { MusicStore } from './music/MusicStore';
import { MusicZoomLevel, MusicState } from './music/MusicState';
import { ScorecardPanel } from './components/panels/Scorecard';
import { RaterZoomLevelControl } from './components/floats/RaterZoomLevelControl';
import { ComparisonRaterType } from './components/rater/comparison-rater/ComparisonRater';
import { MusicAction } from './music/MusicAction';
import { FilterMode } from './music/MusicFilters';
import { RaterUIItem, SCORE_END, SCORE_START } from './models/ItemTypes';
import { AlbumPanel } from './components/panels/AlbumPanel';

export const initialRaterState:RaterState = {
   start: SCORE_START
  ,end: SCORE_END
  ,isReadonly: true
  ,scaler : new Scaler() 
} 

interface Props {
  musicState:MusicState 
  musicDispatch:Dispatch<MusicAction>
}

export const App = ({musicState, musicDispatch}:Props) => {


  // search
  const $artistsPage  =  useGetArtistsPageQuery()
  const [firstLoad, setFirstLoad] = useState<boolean>(true) 
  const [searchAlbum, setSearchAlbum] = useState<ExternalAlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult>()
  const [comparisonRaterOptions, setComparisonRaterOptions] = useState<Map<ComparisonRaterType, boolean>>(new Map([[ComparisonRaterType.OTHER_ARTISTS, true], [ComparisonRaterType.SAME_ARTIST, true], [ComparisonRaterType.WHATS_ON_RATER, false]])) 
  useOnAlbumUpdateSubscription({onData: ({data}) => { console.log('album update',data)}})
  useOnArtistUpdateSubscription({onData: ({data}) => { console.log('artist update', data) } })

  const [$getSearchAlbumTracks, $searchAlbumTracks ] = useGetTracksForSearchAlbumLazyQuery()
  const [createAlbum, ] = useCreateAlbumMutation() 

  const  [filterAwaitingLoad, setFilterAwaitingLoad] = useState<boolean>(false) 

  const [filterMode, setFilterMode] = useState<boolean>(false)
  const [itemsToFilter, setItemsToFilter] = useState<Array<string>>([])

  const [panelArtist, setPanelArtist] = useState<Artist|undefined>() 
  const [panelAlbum, setPanelAlbum] = useState<Album|undefined>() 

  const [$loadArtistFull, $artistFull] = useGetArtistFullLazyQuery()

  const [$loadAlbumsWithoutSongs, $albumsWithoutSongs]  = useGetAlbumsLazyQuery() 
  const [$loadAlbumSongs, $albumSongs]  = useGetAlbumsSongsLazyQuery() 

  // rater 
  const [raterState, raterDispatch] = useReducer<React.Reducer<RaterState,RaterAction>>(raterReducer, initialRaterState )

  const zoomIn = () => {

  } 

  useEffect(() => {
  if (!$artistsPage.loading && $artistsPage.data) {
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: $artistsPage.data.artists.content as Artist[]   }})
      if (firstLoad) {
          musicDispatch({type: 'FILTER_CHANGE', filters: { artistIds: $artistsPage.data.artists.content.map(it => it.id) } }) 
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
        $loadAlbumsWithoutSongs({variables: { ids: artist.albums.map(it => it.id) }})
        setFilterAwaitingLoad(true)
      }
      musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[artist.id]  }, zoomLevel: MusicZoomLevel.ALBUM})
    }
  }

  const onMusicNavArtistExpand = (artist:Artist) => {
      const store = new MusicStore(musicState) 
      if (!store.hasArtistLoadedAlbums(artist)) {
        $loadAlbumsWithoutSongs({variables: { ids: artist.albums.map(it=>it.id) }})
      } 
  }  

  useEffect(() => {
    if (!$albumsWithoutSongs.loading && $albumsWithoutSongs.data) {
      const albums = $albumsWithoutSongs.data.albums
      if (albums && albums.length) {
        if (filterAwaitingLoad) {
          musicDispatch({ type: 'FILTER_CHANGE', filters: { albumIds: albums.map(it => it.id) }})
        }
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
          $loadAlbumSongs({ variables: { albumIds : [album.id] }  })
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
          $loadAlbumsWithoutSongs({ variables: { ids: artist.albums!.map(it => it.id) }})
        }
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] } } )
        break;
      }
      // load all albums (without songs) and add it to the current rater view   
      case MusicZoomLevel.ALBUM: {
        if (!store.hasArtistLoadedAlbums(artist)) {
          $loadAlbumsWithoutSongs({ variables: { ids: artist.albums!.map(it => it.id) }})
        }
        musicDispatch({type:'FILTER_CHANGE', filters: { artistIds: [artist.id] }, mode:FilterMode.ADDITIVE  } )
        break;
      }
      // load all songs for artist and add it to the current rater view  
      case MusicZoomLevel.SONG: {
        if (!store.hasArtistLoadedAlbums(artist)) {
          $loadArtistFull({variables: {artistName :artist.name}})
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
        // we're loading all artists 
        if (store.getSelectedArtists().length === 0) {
          const artists  = store.getLazyArtists()
          if (artists.length) {
            const ids = artists.reduce<Album[]>((acc,curr) =>  [...acc, ...curr.albums], [] ).map(it => it.id)
            $loadAlbumsWithoutSongs({variables :  { ids } })
          }
        } 
        break;
      }
      case MusicZoomLevel.SONG: {
        const store = new MusicStore(musicState) 
        // loading all albums not yet loaded 
        if (store.getSelectedAlbums().length === 0) {
          const albumIds =  store.getLazyAlbums().map(it => it.id) 
          if (albumIds.length) {
            $loadAlbumSongs({ variables: { albumIds } })
          }
        }
        break;
      }
    }
  }, [musicState.zoomLevel, $loadAlbumsWithoutSongs,$loadAlbumSongs, musicState])

  const onAlbumSelect = (album:Album) => {
    if (filterMode) {
      setItemsToFilter(items => [album.id, ...itemsToFilter])
    } else {
      $loadAlbumSongs({variables: { albumIds: [album.id] }})
      musicDispatch({type: 'FILTER_CHANGE', filters: { albumIds:[album.id] }, zoomLevel: MusicZoomLevel.SONG })
    }
  }

  useEffect(() => {
    if (!$albumSongs.loading && $albumSongs.data) {
      const songs = $albumSongs.data.albums!.reduce<Song[]>((acc,curr)=> {
        return [...acc, ...curr.songs ]
      }, [])
        musicDispatch({ type: 'DATA_CHANGE', data: { songs: songs as Song[]} })
      }
  }, [$albumSongs.loading, $albumSongs.data, musicDispatch])

  const onMetadataCategroyClick = (artist:Artist, scoreFilter:{start:number,end:number}) => {
    musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds: [artist.id], albumIds:[], scoreFilter: scoreFilter }, zoomLevel: MusicZoomLevel.SONG  })
  }  

  const onAlbumPanelMetadataCategoryClick = (album:Album, scoreFilter:{start:number,end:number}) => {
    const artist  = new MusicStore(musicState).getArtistForAlbum(album)   
    if (artist) {
      onMetadataCategroyClick(artist,scoreFilter)
    }
  } 
  const handleOnZoomChange = (zoomLevel:MusicZoomLevel) => {
    if (zoomLevel === MusicZoomLevel.SONG) {
      setPanelArtist(undefined)
      setPanelAlbum(undefined)
    }
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
            $loadArtistFull({ variables: { artistName: searchArtistAlbumTracks.artist.name }})
        } 
      }, )
    }
  }, [$searchAlbumTracks.data?.searchExternalAlbumTracks, searchArtist, searchAlbum, createAlbum, $loadArtistFull ] )

  useEffect(() => {
    if (!$artistFull.loading && $artistFull.data && searchAlbum) {

      const songs = $artistFull.data.artist?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$artistFull.data.artist] as Artist[], albums: $artistFull.data.artist?.albums as Album[], songs     }})
      const newAlbum = $artistFull.data.artist?.albums?.find(it => it?.name === searchAlbum?.name )
      if (newAlbum) {
        musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[$artistFull.data.artist!.id] , albumIds: [newAlbum.id] } })
      }
      setSearchArtist(undefined)
      setSearchAlbum(undefined)
      // just loading an artist without search
    } else if (!$artistFull.loading && $artistFull.data && !searchAlbum) {
      const songs = $artistFull.data.artist?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$artistFull.data.artist] as Artist[], albums: $artistFull.data.artist?.albums as Album[], songs     }})
      const albumIds = $artistFull.data.artist?.albums!.map(it => it.id)  
      const songIds = songs?.map(it => it.id)  
      if (albumIds && songIds) {
        musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[$artistFull.data.artist!.id] , albumIds, songIds }, mode:FilterMode.ADDITIVE })
      }
    }
  }, [$artistFull.loading, $artistFull.data, searchAlbum, musicDispatch])

  const goHome = () => {
    musicDispatch({ type : 'FILTER_CHANGE', filters: { artistIds:  musicState.data.artists.map(it => it.id ), albumIds:[], songIds:[], scoreFilter: { start: SCORE_START, end:SCORE_END}} , zoomLevel: MusicZoomLevel.ARTIST  })
  } 

  const handleHover =  (item:RaterUIItem, mode:boolean) => {
    if (mode === false) {
      return;
    }
    const store = new MusicStore(musicState) 
    switch(store.zoomLevel) {
      case MusicZoomLevel.ARTIST : {
        setPanelAlbum(undefined)
        const artist = store.findArtistById(item.id)  
        setPanelArtist(artist)
        break;
      }
      case MusicZoomLevel.ALBUM: {
        const album = store.findAlbumById(item.id)  
        setPanelArtist(undefined)
        setPanelAlbum(album)
        break;
      } 
      case MusicZoomLevel.SONG: {
        return;
      }
    }
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

  return (
    <div className={"App " + ((filterMode)?"filterMode":"")} >
        <div id="left-sidebar" className="sidebar">
           <Search onExternalAlbumSelect={onExternalAlbumSearchClick} />
           <ScorecardPanel musicState={musicState} musicDispatch={musicDispatch} /> 
        </div>
        <div id="right-sidebar" className="sidebar">
          {/* {store.data.artists && <MusicNavigationPanel 
              onArtistExpand={onMusicNavArtistExpand} 
              onArtistSwitch={onArtistSelect}
              onArtistAdd={addArtist}
              onAlbumSwitch={onAlbumSelect} 
              onAlbumAdd={addAlbum}
              state={musicState} 
              artists={store.data.artists} 
          />} */}
          {panelArtist && <ArtistPanel onSongCategoryClick={onMetadataCategroyClick} key={panelArtist.name+ '-panel'} artist={panelArtist}/>}
          {panelAlbum && <AlbumPanel onSongCategoryClick={onAlbumPanelMetadataCategoryClick} key={panelAlbum.name+ '-panel'} album={panelAlbum}/>}
        </div> 
        <div id="controls">
          <button id="home-button" onClick={goHome}>HOME</button>  
          <button id="filter-button" onClick={() => setFilterMode(true)}>FILTER</button>  
          { filterMode && <React.Fragment><button onClick={() => applyFilters(true)}>APPLY</button><button onClick={()=> applyFilters(false)} >CANCEL</button></React.Fragment>}
          <button id="zoom-in" onClick={()=> zoomIn() }>ZOOM-IN</button>
        </div>
        <RaterZoomLevelControl onZoomChange={handleOnZoomChange} value={musicState.zoomLevel} ></RaterZoomLevelControl>
        <div id="rater" className="viz drop-target" ref={drop}>
          <RaterWrapper
          filterMode={filterMode}
          itemsToFilter={itemsToFilter}
          handleHover={handleHover}
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
