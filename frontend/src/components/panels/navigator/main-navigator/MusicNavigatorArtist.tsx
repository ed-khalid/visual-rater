import { useContext } from "react"
import { Artist } from "../../../../generated/graphql"
import { useMusicStateOperator } from "../../../../hooks/MusicStateHooks"
import { NavScoreInfo } from "../NavScoreInfo"
import { ArtistDetails } from "./ArtistDetails"
import { MusicNavigatorContext } from "../../../../providers/MusicNavigationProvider"
import { useDraggable } from "@dnd-kit/core"
import { motion } from 'framer-motion'
import './MusicNavigatorArtist.css'

interface Props {
    artist:Artist
    onArtistSelect:any
    isExpanded:boolean
}

export const MusicNavigatorArtist = ({artist, onArtistSelect, isExpanded}:Props) => {

    const { openOverview, dispatchToRater } = useContext(MusicNavigatorContext) 

    const { attributes, listeners, setNodeRef }= useDraggable({
        id : 'draggable-artist' + artist.id,  
        data: {
            item: {
                type: 'artist',
                id: artist.id  
            }
        }
    }) 

  const musicStateOperator = useMusicStateOperator()  

  const onOverviewClick = (artist:Artist, e:React.MouseEvent) => {
    e.stopPropagation()
    openOverview({ id: artist.id, type: 'artist'})
  }

  const raterAction = (artist:Artist) => {
    const shouldRemove = isOnRater(artist)
    dispatchToRater({
      artistId: artist.id,
    }, shouldRemove)
  }

  const isOnRater = (artist:Artist) => {
    const raterArtists = musicStateOperator.getFatSongs()
    return raterArtists.some(it => it.artist.id === artist.id)
  }

                return <li  key={'artists-panel-item-' + artist.id}>
                <div className="nav-panel-item" >
                    <div className="nav-item-controls">
                      <motion.button whileTap={{scale: 0.9}} whileHover={{scale:1.1}} onClick={() => raterAction(artist)} className="nav-item-action-button"> 
                       { isOnRater(artist)? '-' : '+' }
                      </motion.button>
                      <motion.button whileTap={{scale: 0.9}} whileHover={{scale:1.1}} onClick={(e) => onOverviewClick(artist, e)} className="nav-item-action-button"> 
                       { 'O' }
                      </motion.button>
                      <motion.button animate={{rotate: isExpanded ? 90: 0}} whileTap={{scale:0.9, rotate: 0.9}} whileHover={{scale:1.1}} onClick={() => onArtistSelect(artist)} className="nav-item-action-button">{'>'} </motion.button>
                    </div> 
                    <img {...listeners} {...attributes}  ref={setNodeRef} className="nav-panel-item-thumbnail" src={artist.thumbnail!} />
                    <div className="nav-panel-item-info">
                        <div className="nav-panel-item-info-name">{artist.name} </div>
                    </div>
                    <NavScoreInfo item={artist} type="artist" />
                </div> 
                  { isExpanded && 
                      <ArtistDetails key={"artist-"+artist.id+"-details"} dispatchAlbumToRater={(album, shouldRemove) => dispatchToRater({ artist, albumId: album.id}, shouldRemove)} artist={artist} />    
                  } 
                </li> 
}