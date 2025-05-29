import { useEffect, useState } from "react"
import { MusicNavigatorPanel } from "../components/panels/navigator/main-navigator/MusicNavigatorPanel"
import { Album, Artist, Song, useGetAlbumsSongsLazyQuery, useGetArtistFullLazyQuery, useGetArtistsPageQuery, useOnAlbumUpdateSubscription, useOnArtistUpdateSubscription } from "../generated/graphql"
import { useMusicDispatch, useMusicState, useMusicStateOperator } from "../hooks/MusicStateHooks"
import { RaterEntityRequest, RaterStyle } from "../models/RaterModels"
import { FilterMode } from "../music/MusicFilters"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable } from "@dnd-kit/core"
import { MusicNavigatorContext } from "../providers/MusicNavigationProvider"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import { RaterManager } from "../components/raters/RaterManager"
import { AnimatePresence, motion } from "motion/react"
import { Modal } from "../components/common/Modal"
import { OverviewManager } from "../components/overview/OverviewManager"
import { DraggableItem } from "../models/DragModels"
import { OverviewItem, OverviewLink } from "../models/OverviewModels"


interface Props {
    raterStyle: RaterStyle
}

export const HomePage = ({raterStyle}:Props) => {

  // those will update apollo client data automagically 
  useOnArtistUpdateSubscription()
  useOnAlbumUpdateSubscription()

  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable-rater',
  })


  const musicDispatch = useMusicDispatch()
  const musicState = useMusicState()
  const musicStateOperator = useMusicStateOperator()
  const $artistsPage  =  useGetArtistsPageQuery()
  const [draggedItem, setDraggedItem] = useState<DraggableItem|undefined>(undefined)
  const [showNavPanel, setShowNavPanel] = useState<boolean>(true)
  const [overviewItem, setOverviewItem] =useState<OverviewItem|undefined>(undefined)

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

  const handleOverviewLinkClick = (link:OverviewLink) => {
    if (link.type === 'artist') {
      const artist = musicState.data.artists.find(it => it.id === link.id)
      if (!artist) throw `artist with id ${link.id} not found in data!`
      setOverviewItem({ entity:  artist})
    } else {
      const album = musicState.data.albums.find(it => it.id === link.id)
      if (!album) throw `album with id ${link.id} not found in data!`
      const artist = musicState.data.artists.find(it => it.id == album.artistId) 
      if (!artist) throw `artist with id ${album.artistId} not found in data!`
      setOverviewItem({entity: album, parentEntity: artist})
    }
  }

  const handleDragStart = (event:DragStartEvent) => {
    const item = event.active.data.current?.item
    if (item && item.type) {
        const dataItem:Artist|Album|undefined = (item.type ==='artist') ? musicStateOperator.data.artists.find(it => it.id === item.id) :
        musicStateOperator.data.albums.find(it => it.id === item.id)   
        if (dataItem) {
          setDraggedItem({ type: item.type,id: dataItem.id, name: dataItem.name, thumbnail: dataItem.thumbnail!  })
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

  const handleModalClose = () => {
    setOverviewItem(undefined)
  } 

  const handleOnMusicNavCollapse = () => {
      setShowNavPanel(false)
  }
       
  const mainClassNames = "" + (isOver ? "droppable " : "")   

        return <DndContext modifiers={[snapCenterToCursor]} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <DragOverlay>
            { draggedItem && 
              <div className="dragged-item">
                  <img className="dragged-item-thumbnail" src={draggedItem.thumbnail!} />
                  <div className="dragged-item-text">{draggedItem.name}</div>
              </div>
            }
          </DragOverlay>
          <div id="layout">
            {$artistsPage.data?.artists && 
             <motion.div animate={{ width: showNavPanel ? '420px': 0 }} transition={{ duration: 0.3, ease: "easeInOut"}}     id="left-nav" className="panel nav-panel">
                <MusicNavigatorContext.Provider value={{openOverview: handleOverviewLinkClick, dispatchToRater }}>
                    <MusicNavigatorPanel onCollapse={handleOnMusicNavCollapse} artists={$artistsPage.data?.artists.content as Artist[]}></MusicNavigatorPanel>
                </MusicNavigatorContext.Provider>
            </motion.div>
            }
            <motion.div animate={{width: showNavPanel? `calc(100% - 420px)`: '100%'}} transition={{duration: 0.3, ease: "easeInOut"}} className={mainClassNames}  ref={setNodeRef} id="main">
              {!showNavPanel && 
                <motion.button className="show-left-nav-button" initial={{x:0, opacity:0}} animate={{x:0,opacity:1}} exit={{opacity: 0}} transition={{duration: 0.3}} onClick={() => setShowNavPanel(true) }>
                  NAVPANEL
              </motion.button> }
              <AnimatePresence initial={false} onExitComplete={() => null}>
                {overviewItem && <Modal handleClose={() => handleModalClose()} >
                  <OverviewManager item={overviewItem} onClose={handleModalClose} onLinkClick={handleOverviewLinkClick} />
                  </Modal>}
              </AnimatePresence>
              <RaterManager items={items} raterStyle={raterStyle}   
                totalRows={showNavPanel ? 20 : 15 }
              />
            </motion.div>
          </div> 
        </DndContext>
}