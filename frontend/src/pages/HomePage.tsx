import { useEffect, useState } from "react"
import { MusicNavigatorPanel } from "../components/panels/navigator/main-navigator/MusicNavigatorPanel"
import { Artist, useGetArtistsPageQuery, useOnAlbumUpdateSubscription, useOnArtistUpdateSubscription } from "../generated/graphql"
import { useMusicDispatch, useMusicState, useMusicStateOperator } from "../hooks/MusicStateHooks"
import { RaterEntityRequest, RaterStyle } from "../models/RaterModels"
import { FilterMode } from "../music/MusicFilterModels"
import { MusicNavigatorContext } from "../providers/MusicNavigationProvider"
import { RaterManager } from "../components/raters/RaterManager"
import { AnimatePresence, motion } from "motion/react"
import { Modal } from "../components/common/Modal"
import { OverviewManager } from "../components/overview/OverviewManager"
import { OverviewItem, OverviewLink } from "../models/OverviewModels"


interface Props {
    raterStyle: RaterStyle
}

export const HomePage = ({raterStyle}:Props) => {

  // those will update apollo client data automagically 
  useOnArtistUpdateSubscription()
  useOnAlbumUpdateSubscription()

  const musicDispatch = useMusicDispatch()
  const musicState = useMusicState()
  const musicStateOperator = useMusicStateOperator()
  const [showNavPanel, setShowNavPanel] = useState<boolean>(true)
  const [overviewItem, setOverviewItem] =useState<OverviewItem|undefined>(undefined)

  const dispatchToRater = (addition:RaterEntityRequest, mode:FilterMode) => {
      const playlistFilters = musicState.playlistFilters
      let artistIds:string[]|null = (playlistFilters.artistIds || []).filter(it => it !== addition.artistId)
      let albumIds:string[]|null = (playlistFilters.albumIds || [])
      if (mode === FilterMode.ADDITIVE) {
        artistIds.push(addition.artistId)
      }
      if (addition.albumId) {
        albumIds = albumIds.filter(it => it !== addition.albumId)
        if (mode === FilterMode.ADDITIVE) {
          albumIds.push(addition.albumId)
        }
      }
      if (albumIds.length === 0) albumIds = null
      if (artistIds.length === 0) artistIds = null
      musicDispatch({ type: 'PLAYLIST_FILTER_CHANGE', filters: { ...playlistFilters, artistIds, albumIds }})
  } 

  const handleOverviewLinkClick = (link:OverviewLink) => {
    if (link.type === 'artist') {
      const artist = musicState.data.artists.find(it => it.id === link.id)
      if (!artist) throw `artist with id ${link.id} not found in data!`
      setOverviewItem({ entity:  artist})
    } else {
      const album = musicState.data.albums.find(it => it.id === link.id)
      if (!album) throw `album with id ${link.id} not found in data!`
      const artist = musicState.data.artists.find(it => it.id == album.artist.id) 
      if (!artist) throw `artist with id ${album.artist.id} not found in data!`
      setOverviewItem({entity: album, parentEntity: artist})
    }
  }

  const items = musicStateOperator.getSongs()

  const handleModalClose = () => {
    setOverviewItem(undefined)
  } 

  const handleOnMusicNavCollapse = () => {
      setShowNavPanel(false)
  }
       
        return <div id="layout">
            
             <motion.div animate={{ width: showNavPanel ? '420px': 0 }} transition={{ duration: 0.3, ease: "easeInOut"}}     id="left-nav" className="panel nav-panel">
                <MusicNavigatorContext.Provider value={{openOverview: handleOverviewLinkClick, dispatchToRater }}>
                    <MusicNavigatorPanel onCollapse={handleOnMusicNavCollapse}></MusicNavigatorPanel>
                </MusicNavigatorContext.Provider>
            </motion.div>
            
            <motion.div animate={{width: showNavPanel? `calc(100% - 420px)`: '100%'}} transition={{duration: 0.3, ease: "easeInOut"}} id="main">
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
}