import { Artist } from "../../../../generated/graphql"
import { FilterMode } from "../../../../music/MusicFilterModels"
import { useMusicDispatch, useMusicStateOperator } from "../../../../hooks/MusicStateHooks"
import { MusicNavigatorArtistRow } from "./artist/MusicNavigatorArtistRow"
import { useState } from "react"
import './MusicNavigatorPanel.css'
import { motion } from 'motion/react'

interface Props {
    artists: Artist[]
    onCollapse: ()  => void
}

type NavigatorContent = 'artists' | 'albums' 

export const MusicNavigatorPanel = ({artists, onCollapse}: Props) => {

  const [mode, setMode] = useState<NavigatorContent>('artists')

  const [primaryTitle, setPrimaryTitle] = useState<string>('artists')
  const [secondaryTitleOne, setSecondaryTitleOne] = useState<string>('albums')
  const [expandedIds, setExpandedIds] = useState<string[]>([]) 


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
    setExpandedIds(prev => {
      if (prev.includes(artist.id)) {
        return prev.filter(id => id !== artist.id)
      } else {
        return [...prev, artist.id]
      }
    })
  }

  const handleCollapseClick = () => {
    onCollapse()
  } 

  const handleTitleSwitch = (isFirst:boolean) => {
    if (isFirst) {
      setPrimaryTitle(secondaryTitleOne)
      setSecondaryTitleOne(primaryTitle)
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
                  </div>
                  <div className="panel-control-icons">
                    <button onClick={() => handleCollapseClick()} className="collapse-button">{'<'}</button>
                  </div>
        </div>
        <div className="panel-content">
        <ul id="artists-list">
                {artists.map(artist => 
                <MusicNavigatorArtistRow key={'music-nav-artist-' + artist.id} artist={artist} isExpanded={expandedIds.includes(artist.id)} onArtistSelect={onArtistSelect} />
              )}
        </ul>
        </div>
  </>

}