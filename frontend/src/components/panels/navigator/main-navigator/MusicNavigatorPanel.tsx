import { Album, Artist, useGetAlbumsPageLazyQuery, useGetArtistsPageLazyQuery } from "../../../../generated/graphql"
import { MusicNavigatorArtistRow } from "./artist/MusicNavigatorArtistRow"
import { useEffect, useState } from "react"
import './MusicNavigatorPanel.css'
import { motion } from 'motion/react'
import { MusicNavigatorAlbumRow } from "./album/MusicNavigatorAlbumRow"
import { ArtistOrAlbum } from "../../../overview/OverviewManager"

interface Props {
    onCollapse: ()  => void
}


export const MusicNavigatorPanel = ({onCollapse}: Props) => {

  const [mode, setMode] = useState<ArtistOrAlbum>('artist')
  const [$artistsPage, $artistsPageResult]  =  useGetArtistsPageLazyQuery({ variables: {params: {pageNumber: 0}}})
  const [$albumsPage, $albumsPageResult] = useGetAlbumsPageLazyQuery({variables: { params: { pageNumber: 0  }}}) 
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])

  useEffect(() => {
    if (mode === 'artist') {
      $artistsPage()
    } else {
      $albumsPage()
    }
  }, [mode])

  useEffect(() => {
    if ($artistsPageResult.data?.artists) {
      setArtists($artistsPageResult.data.artists.content as Artist[])
    }
  }, [$artistsPageResult.data])

  useEffect(() => {
    if ($albumsPageResult.data?.albums) {
      setAlbums($albumsPageResult.data.albums.content as Album[])
    }
  }, [$albumsPageResult.data])



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


  const onExpand = ({id}: { id: string}) => {
    setExpandedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(expandedId => expandedId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleCollapseClick = () => {
    onCollapse()
  } 

  const handleTitleSwitch = () => {
      setPrimaryTitle(secondaryTitleOne)
      setSecondaryTitleOne(primaryTitle)
      setMode(prev => prev === 'artist' ? 'album' : 'artist')
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
                    <motion.div custom="up" variants={arcVariant} initial="initial" animate="animate" exit="exit" onClick={() => handleTitleSwitch()} className="alternate-title">{secondaryTitleOne}</motion.div>
                  </div>
                  <div className="panel-control-icons">
                    <button onClick={() => handleCollapseClick()} className="collapse-button">{'<'}</button>
                  </div>
        </div>
        <div className="panel-content">
        { mode === 'artist' && 
        <ul id="artists-list">
                {artists.map(artist => 
                <MusicNavigatorArtistRow key={'music-nav-artist-' + artist.id} artist={artist} />
              )}
        </ul>}
        { mode === 'album' && 
        <ul id="albums-list">
                {albums.map(album => 
                <MusicNavigatorAlbumRow key={'music-nav-album-' + album.id} album={album} />
              )}
        </ul>}
        </div>
  </>

}