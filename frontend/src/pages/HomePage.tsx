import { useState } from "react"
import { MusicNavigatorPanel } from "../components/panels/navigator/main-navigator/MusicNavigatorPanel"
import { useOnAlbumUpdateSubscription, useOnArtistUpdateSubscription } from "../generated/graphql"
import { RaterEntityRequest, RaterStyle } from "../models/RaterModels"
import { FilterMode } from "../music/MusicFilterModels"
import { MusicNavigatorContext } from "../providers/MusicNavigationProvider"
import { RaterManager } from "../components/raters/RaterManager"
import { AnimatePresence, motion } from "motion/react"
import { Modal } from "../components/common/Modal"
import { OverviewManager } from "../components/overview/OverviewManager"
import { OverviewLink } from "../models/OverviewModels"
import { useMusicDispatch, useMusicState } from "../hooks/MusicStateHooks"


interface Props {
    raterStyle: RaterStyle
}

export const HomePage = ({raterStyle}:Props) => {

  // those will update apollo client data automagically 
  useOnArtistUpdateSubscription()
  useOnAlbumUpdateSubscription()

  const musicDispatch = useMusicDispatch()
  const musicState = useMusicState()
  const [showNavPanel, setShowNavPanel] = useState<boolean>(true)
  const [overviewLink, setOverviewLink] =useState<OverviewLink|undefined>(undefined)

  const dispatchToRater = (addition:RaterEntityRequest, mode:FilterMode) => {
      const songFilters = musicState.songFilters
      let artistIds:string[]|null = (songFilters.artistIds || []).filter(it => it !== addition.artistId)
      let albumIds:string[]|null = (songFilters.albumIds || [])
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
      musicDispatch({ type: 'PLAYLIST_FILTER_CHANGE', filters: { ...songFilters, artistIds, albumIds }})
  } 

  const handleOverviewLinkClick = (link:OverviewLink) => {
    setOverviewLink(link)
  }


  const handleModalClose = () => {
    setOverviewLink(undefined)
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
                {overviewLink && <Modal handleClose={() => handleModalClose()} >
                  <OverviewManager link={overviewLink} onClose={handleModalClose} onLinkClick={handleOverviewLinkClick} />
                  </Modal>}
              </AnimatePresence>
              <RaterManager raterStyle={raterStyle}   
                totalRows={showNavPanel ? 20 : 15 }
              />
            </motion.div>
          </div> 
}