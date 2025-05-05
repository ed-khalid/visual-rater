import React, { Dispatch, useEffect, useState } from 'react';
import './App.css';
import {  Artist, Song, Album, useOnAlbumUpdateSubscription, useOnArtistUpdateSubscription, useGetArtistsPageQuery, useGetAlbumsSongsLazyQuery, useGetAlbumsLazyQuery, useGetArtistFullLazyQuery } from './generated/graphql';
import { ArtistPanel } from './components/panels/ArtistPanel';
import { MusicStore } from './music/MusicStore';
import { MusicZoomLevel, MusicState } from './music/MusicState';
import { MusicAction } from './music/MusicAction';
import { FilterMode } from './music/MusicFilters';
import { AlbumPanel } from './components/panels/AlbumPanel';
import { AddSection } from './components/sidebars/left/AddSection';
import { GridRater } from './components/rater/GridRater';
import { MusicNavigatorPanel } from './components/sidebars/left/ArtistsPanel';


interface Props {
  musicState:MusicState 
  musicDispatch:Dispatch<MusicAction>
}

export const App = ({musicState, musicDispatch}:Props) => {


  const [newAlbumName, setNewAlbumName] =useState<string|undefined>() 

  const [panelArtist, setPanelArtist] = useState<Artist|undefined>() 
  const [panelAlbum, setPanelAlbum] = useState<Album|undefined>() 

  // graphql 
  const $artistsPage  =  useGetArtistsPageQuery()
  const [$loadArtistFull, $artistFull] = useGetArtistFullLazyQuery()
  useOnAlbumUpdateSubscription({onData: ({data}) => { console.log('album update',data)}})
  useOnArtistUpdateSubscription({onData: ({data}) => { console.log('artist update', data) } })


  // used on initial page load to load artists into musicState
  useEffect(() => {
  if (!$artistsPage.loading && $artistsPage.data) {
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: $artistsPage.data.artists.content as Artist[]   }})
  }
  }, [$artistsPage.loading, $artistsPage.data, musicDispatch])



  useEffect(() => {
    if (!$artistFull.loading && $artistFull.data && newAlbumName) {

      const songs = $artistFull.data.artist?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$artistFull.data.artist] as Artist[], albums: $artistFull.data.artist?.albums as Album[], songs     }})
      const newAlbum = $artistFull.data.artist?.albums?.find(it => it?.name === newAlbumName )
      if (newAlbum) {
        musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[$artistFull.data.artist!.id] , albumIds: [newAlbum.id] } })
      }
      // just loading an artist without search
    } else if (!$artistFull.loading && $artistFull.data && !newAlbumName) {
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
  }, [$artistFull.loading, $artistFull.data, musicDispatch, newAlbumName])


  const onCreateAlbum = (artistName:string, albumName:string) => {
    setNewAlbumName(albumName)
    $loadArtistFull({variables: { artistName}})
  }
  const onMetadataCategroyClick = (artist:Artist, scoreFilter:{start:number,end:number}) => {
    musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds: [artist.id], albumIds:[], scoreFilter: scoreFilter }, zoomLevel: MusicZoomLevel.SONG  })
  }  

  const onAlbumPanelMetadataCategoryClick = (album:Album, scoreFilter:{start:number,end:number}) => {
    const artist  = new MusicStore(musicState).getArtistForAlbum(album)   
    if (artist) {
      onMetadataCategroyClick(artist,scoreFilter)
    }
  } 

  const onAlbumsPanelClose = (artist:Artist) => {
    const artistIds = musicState.filters.artistIds.filter((id) => { id !== artist.id })
    musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds  } })
  }
  const onSongsPanelClose = (album:Album) => {
    const albumIds = musicState.filters.albumIds.filter((id) => { id !== album.id })
    musicDispatch({ type: 'FILTER_CHANGE', filters: { albumIds  } })
  }

  const store = new MusicStore(musicState) 
  const items = store.getSelectedSongsAsUIItems()  



  return (
    <div className="App" >
      <div className='header'>
        VisRater 
      </div>
        <div id="left-sidebar" className="sidebar">
          <AddSection onCreateAlbum={onCreateAlbum} />
          {$artistsPage.data?.artists && 
            <MusicNavigatorPanel artists={$artistsPage.data?.artists.content as Artist[]}></MusicNavigatorPanel>
          }
          {panelArtist && <ArtistPanel onSongCategoryClick={onMetadataCategroyClick} key={panelArtist.name+ '-panel'} artist={panelArtist}/>}
          {panelAlbum && <AlbumPanel onSongCategoryClick={onAlbumPanelMetadataCategoryClick} key={panelAlbum.name+ '-panel'} album={panelAlbum}/>}
        </div>
        <div id="main">
          <GridRater items={items} />
        </div>
        {/* <div id="rater">
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
        </div> */}
    </div>
  );
}

export default App;
