import { useContext } from "react"
import { Artist } from "../../../../../generated/graphql"
import { useMusicState, useMusicStateOperator } from "../../../../../hooks/MusicStateHooks"
import { NavScoreInfo } from "../../NavScoreInfo"
import { MusicNavigatorContext } from "../../../../../providers/MusicNavigationProvider"
import { useDraggable } from "@dnd-kit/core"
import { VisualRaterButton } from "../../../../common/VisRaterButton"
import { AlbumsSubpanel } from "./AlbumsSubpanel"
import { FiChevronDown, FiChevronUp, FiEye } from "react-icons/fi"
import { FilterMode } from "../../../../../music/MusicFilterModels"
import { motion } from "motion/react"

interface Props {
    artist:Artist
    onArtistSelect:any
    isExpanded:boolean
}

export const MusicNavigatorArtistRow = ({artist, onArtistSelect, isExpanded}:Props) => {

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

  const musicState = useMusicState() 
  

  const onOverviewClick = (artist:Artist, e:React.MouseEvent) => {
    e.stopPropagation()
    openOverview({ id: artist.id, type: 'artist'})
  }
  const isOnRater = (artist:Artist) => {
    return musicState.playlistFilters.artistIds?.some(it => it === artist.id) || false
  }

                return <li  key={'artists-panel-item-' + artist.id}>
                <div className="nav-panel-item" >
                    <div className="nav-item-controls">
                      <div className="controls-label">
                        rater 
                      </div>
                      <VisualRaterButton additionalClassNames={ isOnRater(artist) ? 'toggle pressed' : ''} onClick={() => dispatchToRater({artistId: artist.id}, isOnRater(artist)? FilterMode.REDUCTIVE : FilterMode.ADDITIVE )} >
                       <FiEye/>  
                       </VisualRaterButton> 
                      <VisualRaterButton onClick={() => dispatchToRater({artistId: artist.id}, FilterMode.EXCLUSIVE)} >
                        !
                       </VisualRaterButton> 
                    </div> 
                    <img {...listeners} {...attributes}  ref={setNodeRef} className="nav-panel-item-thumbnail" src={artist.thumbnail!} />
                    <div className="nav-panel-item-info">
                        <div className="nav-panel-item-info-name">
                          <span onClick={(e:React.MouseEvent) => onOverviewClick(artist,e)}>
                            {artist.name}
                          </span> 
                        </div>
                        <div className="accordion-toggle">
                            <button onClick={(_) => onArtistSelect(artist)} >
                              <motion.span animate={{rotate: isExpanded ? 100: 0 }} transition={{duration: 0.25}}>
                                  {isExpanded ? <FiChevronUp size={16}/> : <FiChevronDown size={16} />}
                              </motion.span>
                              </button> 
                        </div>
                    </div>
                    <NavScoreInfo item={artist} type="artist" />
                </div> 
                  { isExpanded && 
                      <AlbumsSubpanel key={"artist-"+artist.id+"-details"} dispatchAlbumToRater={(album, mode) => dispatchToRater({ artistId: artist.id, albumId: album.id}, mode)} artist={artist} />    
                  } 
                </li> 
}