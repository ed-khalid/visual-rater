import { Artist } from "../../../../generated/graphql"
import { FilterMode } from "../../../../music/MusicFilters"
import { useMusicDispatch, useMusicStateOperator } from "../../../../hooks/MusicStateHooks"
import { MusicNavigatorArtistRow } from "./artist/MusicNavigatorArtistRow"
import { useState } from "react"
import './MusicNavigatorPanel.css'
import { motion } from 'motion/react'

interface Props {
    artists: Artist[]
    onCollapse: ()  => void
}

export const MusicNavigatorPanel = ({artists, onCollapse}: Props) => {


  const [primaryTitle, setPrimaryTitle] = useState<string>('artists')
  const [secondaryTitleOne, setSecondaryTitleOne] = useState<string>('albums')
  const [secondaryTitleTwo, setSecondaryTitleTwo] = useState<string>('songs')
  const musicDispatch = useMusicDispatch()
  const musicStateOperator = useMusicStateOperator() 

  const sortedArtists = [...artists].sort((a,b) => b.score - a.score)  
  const expandedArtistIds = musicStateOperator.navigationFilters.map(it => it.artistId)   

  const arcVariant = {
    initial: (direction:'up'|'down') => ({
      y: (direction === 'up') ? 50 : -50,
      opacity: 0,
      scale: 0.0
    }),
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    exit: (direction:'up'|'down') => ({
      y: (direction === 'up') ? -50: 50,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    })

  } 


  const onArtistSelect = (artist:Artist) => {
    (expandedArtistIds.includes(artist.id)) ?  
      musicDispatch({type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId: artist.id, mode: FilterMode.REDUCTIVE }) :
      musicDispatch({type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId: artist.id, mode: FilterMode.ADDITIVE }) 
  }
  const handleCollapseClick = () => {
    onCollapse()
  } 

  const handleTitleSwitch = (isFirst:boolean) => {
    if (isFirst) {
      setPrimaryTitle(secondaryTitleOne)
      setSecondaryTitleOne(primaryTitle)
    } else {
      setPrimaryTitle(secondaryTitleTwo)
      setSecondaryTitleTwo(primaryTitle)
    }

  } 
  const arcAnimation = {
    up: {
      y: [-50, -80, -50, 0],
      opacity: [0, 1],
      transition: { duration: 0.6, ease: "easeInOut" },
    },
    down: {
      y: [50, 80, 50, 0],
      opacity: [0, 1],
      transition: { duration: 0.6, ease: "easeInOut" },
    }
  };


  return <>
        <div  className="panel-header">
                  <motion.div custom="down" variants={arcVariant} initial="initial" animate="animate" exit="exit" className="panel-title">{primaryTitle}</motion.div> 
                  <div className="alternate-titles">
                    <motion.div custom="up" variants={arcVariant} initial="initial" animate="animate" exit="exit" onClick={() => handleTitleSwitch(true)} className="alternate-title">{secondaryTitleOne}</motion.div>
                    <motion.div custom="up" variants={arcVariant} initial="initial" animate="animate" exit="exit" onClick={() => handleTitleSwitch(false)} className="alternate-title">{secondaryTitleTwo}</motion.div>
                  </div>
                  <div className="panel-control-icons">
                    <button onClick={() => handleCollapseClick()} className="collapse-button">{'<'}</button>
                  </div>
        </div>
        <div className="panel-content">
        <ul id="artists-list">
                {sortedArtists.map(artist => 
                <MusicNavigatorArtistRow key={'music-nav-artist-' + artist.id} artist={artist} isExpanded={expandedArtistIds.includes(artist.id)} onArtistSelect={onArtistSelect} />
              )}
        </ul>
        </div>
  </>

}