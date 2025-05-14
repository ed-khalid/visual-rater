import React, { Dispatch, useEffect, useState } from 'react';
import './App.css';
import './components/common/Panel.css'
import {  Artist, Song, Album, useOnAlbumUpdateSubscription, useOnArtistUpdateSubscription, useGetArtistsPageQuery, useGetAlbumsSongsLazyQuery, useGetArtistFullLazyQuery } from './generated/graphql';
import { MusicStore } from './music/MusicStore';
import { MusicState } from './music/MusicState';
import { MusicAction } from './music/MusicAction';
import { FilterMode } from './music/MusicFilters';
import { AddSection } from './components/newalbum/AddSection';
import { GridRater } from './components/raters/grid/GridRater';
import { MusicNavigatorPanel } from './components/navigator/MusicNavigatorPanel';
import { RaterEntityRequest } from './models/RaterTypes';
import { RaterIconGridSvg } from './components/svg/RaterIconGridSvg';
import { RaterIconListSvg } from './components/svg/RaterIconListSvg';
import { BlockRater } from './components/raters/block/BlockRater';
import { RaterIconCartesianSvg } from './components/svg/RaterIconCartesianSvg';
import { CartesianRaterWrapper } from './components/raters/cartesian/CartesianRaterWrapper';

enum RaterStyle {
  GRID, LIST, CARTESIAN
}

interface Props {
  musicState:MusicState 
  musicDispatch:Dispatch<MusicAction>
}

export const App = ({musicState, musicDispatch}:Props) => {

  const stateOperator  = new MusicStore(musicState)  
  const [newAlbumName, setNewAlbumName] =useState<string|undefined>() 

  const [raterStyle, setRaterStyle] = useState<RaterStyle>(RaterStyle.GRID)  

  // graphql 
  const $artistsPage  =  useGetArtistsPageQuery()
  const [$loadArtistFull, $artistFull] = useGetArtistFullLazyQuery()
  const [$loadSongsForAlbum, $songsForAlbum] = useGetAlbumsSongsLazyQuery()
  useOnAlbumUpdateSubscription({onData: ({data}) => { console.log('album update',data)}})
  useOnArtistUpdateSubscription({onData: ({data}) => { console.log('artist update', data) } })


  // used on initial page load to load artists into musicState
  useEffect(() => {
  if (!$artistsPage.loading && $artistsPage.data) {
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: $artistsPage.data.artists.content as Artist[]   }})
  }
  }, [$artistsPage.loading, $artistsPage.data, musicDispatch])



  useEffect(() => {
    if (!$artistFull.loading && $artistFull.data) {
      const songs = $artistFull.data.artist?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$artistFull.data.artist] as Artist[], albums: $artistFull.data.artist?.albums as Album[], songs     }})
      musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds:[$artistFull.data.artist!.id] }, mode:FilterMode.ADDITIVE })
    }
  }, [$artistFull.loading, $artistFull.data, musicDispatch])
  useEffect(() => {
    if (!$songsForAlbum.loading && $songsForAlbum.data) {
      const songs =  $songsForAlbum.data.albums?.reduce<Array<Song>>((acc,curr) => { 
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { songs }})
      const albumId = songs?.at(0)!.albumId
      const artistId = songs?.at(0)!.artistId 
      if (albumId && artistId) {
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds: [artistId] } , mode: FilterMode.ADDITIVE })
      }
    }

  }, [$songsForAlbum.loading, $songsForAlbum.data, musicDispatch])


  const onCreateAlbum = (artistName:string, albumName:string) => {
    setNewAlbumName(albumName)
  }

  const dispatchToRater = (addition:RaterEntityRequest, shouldRemove:boolean) => {
    if (shouldRemove) {
      if (!addition.albumId) {
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds: [addition.artist.id] }, mode: FilterMode.REDUCTIVE })
      } else {
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { albumIds: [addition.albumId] }, mode: FilterMode.REDUCTIVE })
      }
    } else {
      if (!addition.albumId) {
        $loadArtistFull({ variables: { artistName: addition.artist.name } })
      } else {
        $loadSongsForAlbum({ variables: { albumIds: [addition.albumId] } })
      }
    }
  } 

  const fatSongs = stateOperator.getFatSongs()  


  return (
    <div className="App" >
      <div className='header'>
        <RaterIconGridSvg onClick={() => setRaterStyle(RaterStyle.GRID)  }/>
        <RaterIconListSvg onClick={() => setRaterStyle(RaterStyle.LIST) }/>
        <RaterIconCartesianSvg onClick={() => setRaterStyle(RaterStyle.CARTESIAN) }/>
        
        VisRater 
      </div>
        <div id="left-sidebar" className="sidebar">
          <AddSection onCreateAlbum={onCreateAlbum} />
          {$artistsPage.data?.artists && 
            <MusicNavigatorPanel musicState={musicState} musicDispatch={musicDispatch} dispatchToRater={dispatchToRater} artists={$artistsPage.data?.artists.content as Artist[]}></MusicNavigatorPanel>
          }
          {/* {panelArtist && <ArtistPanel onSongCategoryClick={onMetadataCategoryClick} key={panelArtist.name+ '-panel'} artist={panelArtist}/>}
          {panelAlbum && <AlbumPanel onSongCategoryClick={onAlbumPanelMetadataCategoryClick} key={panelAlbum.name+ '-panel'} album={panelAlbum}/>} */}
        </div>
        <div id="main">
          {raterStyle === RaterStyle.GRID && <GridRater items={fatSongs} />}
          {raterStyle === RaterStyle.LIST && <BlockRater items={fatSongs} />}
          {/* {raterStyle === RaterStyle.CARTESIAN && 
            <CartesianRaterWrapper
            items={raterItems}
            musicDispatch={musicDispatch}
            musicState={musicState}
            />
          } */}
        </div>
    </div>
  );
}

export default App;
