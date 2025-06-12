import { useEffect, useState } from "react"
import { MusicNavigatorPanel } from "../components/panels/navigator/main-navigator/MusicNavigatorPanel"
import { Album, Artist, Song, useGetAlbumsSongsLazyQuery, useGetArtistFullLazyQuery, useGetArtistsPageQuery, useGetSongsPageQuery, useOnAlbumUpdateSubscription, useOnArtistUpdateSubscription } from "../generated/graphql"
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
  const $artistsPage  =  useGetArtistsPageQuery()
  const $songsPage = useGetSongsPageQuery({ variables: { pageNumber: 0 } }) 
  const [showNavPanel, setShowNavPanel] = useState<boolean>(true)
  const [overviewItem, setOverviewItem] =useState<OverviewItem|undefined>(undefined)
  const [playlistItems, setPlaylistItems] = useState<Song[]>([])

  const [$loadArtistFull, $artistFull] = useGetArtistFullLazyQuery()
  const [$loadSongsForAlbum, $songsForAlbum] = useGetAlbumsSongsLazyQuery()

  // used on initial page load to load artists into musicState
  useEffect(() => {
  if (!$artistsPage.loading && $artistsPage.data) {
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: $artistsPage.data.artists.content as Artist[]   }})
  }
  }, [$artistsPage.loading, $artistsPage.data, musicDispatch])

  useEffect(() => {
    if (!$songsPage.loading && $songsPage.data) {
      musicDispatch({ type: 'DATA_CHANGE', data: { songs: $songsPage.data.songs.content as Song[] }})
      setPlaylistItems($songsPage.data.songs.content as Song[])
    }

  }, [$songsPage.loading, $songsPage.data, musicDispatch])

  useEffect(() => {
    if (!$artistFull.loading && $artistFull.data) {
      const songs = $artistFull.data.artist?.albums?.reduce<Array<Song>>((acc,curr) => {
        return [...acc, ...curr!.songs]
      }, [])
      const artistId = $artistFull.data.artist?.id 
      const albumIds = $artistFull.data.artist?.albums.map(it => it.id) 
      musicDispatch({ type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId, mode: FilterMode.ADDITIVE })
      musicDispatch({ type: 'RATER_FILTER_ARTIST_CHANGE', artistId, albumIds, mode: FilterMode.ADDITIVE })
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [$artistFull.data.artist] as Artist[], albums: $artistFull.data.artist?.albums as Album[], songs     }})
    }
  }, [$artistFull.loading, $artistFull.data, musicDispatch])

  useEffect(() => {
    if (!$songsForAlbum.loading && $songsForAlbum.data) {
      const songs =  $songsForAlbum.data.albums?.reduce<Array<Song>>((acc,curr) => { 
        return [...acc, ...curr!.songs]
      }, [])
      musicDispatch({ type: 'DATA_CHANGE', data: { songs }})
      const albumId = songs?.at(0)!.album.id
      const artistId = songs?.at(0)!.artist.id 
      if (albumId && artistId) {
        musicDispatch({ type: 'RATER_FILTER_ALBUM_CHANGE', artistId , albumId, mode: FilterMode.ADDITIVE })
      }
    }

  }, [$songsForAlbum.loading, $songsForAlbum.data, musicDispatch])

  const dispatchToRater = (addition:RaterEntityRequest, mode:FilterMode) => {
      // artist
      if (!addition.albumId) {
        if (mode !== FilterMode.REDUCTIVE) {
        $loadArtistFull({ variables: { artistId: addition.artistId } })
        }
        const albumIds = musicState.data.artists.find(it => it.id === addition.artistId)?.albums.map(it => it.id) 

        musicDispatch({ type: 'RATER_FILTER_ARTIST_CHANGE', artistId: addition.artistId , albumIds: albumIds!, mode })
      } else {
        // album
        if (mode !== FilterMode.REDUCTIVE) {
          $loadSongsForAlbum({ variables: { albumIds: [addition.albumId] } })
        }
        musicDispatch({ type: 'RATER_FILTER_ALBUM_CHANGE', albumId: addition.albumId, artistId: addition.artistId, mode })
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

  const items = musicStateOperator.getSongs()

  const handleModalClose = () => {
    setOverviewItem(undefined)
  } 

  const handleOnMusicNavCollapse = () => {
      setShowNavPanel(false)
  }
       
        return <div id="layout">
            {$artistsPage.data?.artists && 
             <motion.div animate={{ width: showNavPanel ? '420px': 0 }} transition={{ duration: 0.3, ease: "easeInOut"}}     id="left-nav" className="panel nav-panel">
                <MusicNavigatorContext.Provider value={{openOverview: handleOverviewLinkClick, dispatchToRater }}>
                    <MusicNavigatorPanel onCollapse={handleOnMusicNavCollapse} artists={$artistsPage.data?.artists.content as Artist[]}></MusicNavigatorPanel>
                </MusicNavigatorContext.Provider>
            </motion.div>
            }
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
              <RaterManager items={(raterStyle === RaterStyle.PLAYLIST ? playlistItems : items)} raterStyle={raterStyle}   
                totalRows={showNavPanel ? 20 : 15 }
              />
            </motion.div>
          </div> 
}