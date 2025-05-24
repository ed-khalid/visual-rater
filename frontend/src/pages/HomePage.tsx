import { useEffect, useState } from "react"
import { MusicNavigatorPanel } from "../components/panels/navigator/main-navigator/MusicNavigatorPanel"
import { Album, Artist, Song, useGetAlbumsSongsLazyQuery, useGetArtistFullLazyQuery, useGetArtistsPageQuery } from "../generated/graphql"
import { useMusicDispatch, useMusicStateOperator } from "../hooks/MusicStateHooks"
import { RaterEntityRequest } from "../models/RaterTypes"
import { FilterMode } from "../music/MusicFilters"
import { RaterStyle } from "../App"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable } from "@dnd-kit/core"
import { MusicNavigatorContext } from "../providers/MusicNavigationProvider"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import { RaterManager } from "../components/raters/RaterManager"


interface Props {
    raterStyle: RaterStyle
}

export type DraggableItem = {
  id: string
  name: string
  thumbnail: string
} 
export const HomePage = ({raterStyle}:Props) => {

  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable-rater',
  })


  const musicDispatch = useMusicDispatch()
  const musicStateOperator = useMusicStateOperator()
  const $artistsPage  =  useGetArtistsPageQuery()
  const [draggedItem, setDraggedItem] = useState<DraggableItem|undefined>(undefined)
  const [raterMiniMode, setRaterMiniMode] = useState<boolean>(true)

  const [$loadArtistFull, $artistFull] = useGetArtistFullLazyQuery()
  const [$loadSongsForAlbum, $songsForAlbum] = useGetAlbumsSongsLazyQuery()

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
      const albumIds = $artistFull.data.artist?.albums.map(it => it.id) 
      const artistId = $artistFull.data.artist?.id 
      musicDispatch({ type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId, mode: FilterMode.ADDITIVE })
      musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { albumIds }, mode: FilterMode.ADDITIVE })
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$artistFull.data.artist] as Artist[], albums: $artistFull.data.artist?.albums as Album[], songs     }})
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

  const dispatchToRater = (addition:RaterEntityRequest, shouldRemove:boolean) => {
    if (shouldRemove) {
      if (!addition.albumId) {
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds: [addition.artistId] }, mode: FilterMode.REDUCTIVE })
      } else {
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { albumIds: [addition.albumId] }, mode: FilterMode.REDUCTIVE })
      }
    } else {
      if (!addition.albumId) {
        $loadArtistFull({ variables: { artistId: addition.artistId } })
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds:[addition.artistId] }, mode:FilterMode.ADDITIVE })
      } else {
        $loadSongsForAlbum({ variables: { albumIds: [addition.albumId] } })
        musicDispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds: [addition.artistId], albumIds: [addition.albumId] } , mode: FilterMode.ADDITIVE })
      }
    }
  } 
  const [contextArtists, setContextArtists] = useState<Artist[]>([])

  const openArtistOverview = (artist:Artist) => { 
    if (contextArtists.includes(artist)) {
      setContextArtists(contextArtists.filter(it => it.id !== artist.id))
    } else {
      setContextArtists([...contextArtists, artist])
    }
  }
  const onContextArtistClose = (artist:Artist) => { 
    setContextArtists(contextArtists.filter(it => it.id !== artist.id))
  }

  const handleDragStart = (event:DragStartEvent) => {
    const item = event.active.data.current?.item
    if (item && item.type) {
        const dataItem:Artist|Album|undefined = (item.type ==='artist') ? musicStateOperator.data.artists.find(it => it.id === item.id) :
        musicStateOperator.data.albums.find(it => it.id === item.id)   
        if (dataItem) {
          setDraggedItem({ id: dataItem.id, name: dataItem.name, thumbnail: dataItem.thumbnail!  })
        }
    }
  } 

  const items = musicStateOperator.getFatSongs()

  const handleDragEnd = (event:DragEndEvent) => {
        const item = event.active.data.current?.item
        if (item) {
          if (item.type === 'artist') {
            dispatchToRater({ artistId: item.id },  false)
          } else {
            const artist = musicStateOperator.getArtistForAlbum({ albumId: item.id })
            if (!artist) throw "Artist not found!"
            dispatchToRater({ albumId: item.id, artistId: artist.id },  false)
          }
        }
  } 

  const handleOnMusicNavExpand = (isExpanded:boolean) => {
      setRaterMiniMode(isExpanded)
  }
       

        return <DndContext modifiers={[snapCenterToCursor]} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <DragOverlay>
            { draggedItem && 
              <div className="dragged-item">
                  <img className="dragged-item-thumbnail" src={draggedItem.thumbnail!} />
                  <div className="dragged-item-text">{draggedItem.name}</div>
              </div>
            }
          </DragOverlay>
          {$artistsPage.data?.artists && 
          <MusicNavigatorContext.Provider value={{openArtistOverview, dispatchToRater }}>
              <MusicNavigatorPanel onExpand={handleOnMusicNavExpand} artists={$artistsPage.data?.artists.content as Artist[]}></MusicNavigatorPanel>
          </MusicNavigatorContext.Provider>
          }
        {/* <ContextManager onClose={onContextArtistClose}  musicDispatch={musicDispatch} artists={contextArtists} /> */}
        <div className={ isOver ? 'droppable' : ''  }  ref={setNodeRef} id="main">
          <RaterManager items={items} raterStyle={raterStyle} isMiniMode={raterMiniMode}   
            totalRows={raterMiniMode ? 20 : 15 }
          />
          {/* {raterStyle === RaterStyle.CARTESIAN && 
            <CartesianRaterWrapper
            items={raterItems}
            musicDispatch={musicDispatch}
            musicState={musicState}
            />
          } */}
        </div></DndContext>
}