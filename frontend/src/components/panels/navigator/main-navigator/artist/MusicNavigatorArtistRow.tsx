import { useContext } from "react"
import { Artist } from "../../../../../generated/graphql"
import { useMusicStateOperator } from "../../../../../hooks/MusicStateHooks"
import { NavScoreInfo } from "../../NavScoreInfo"
import { MusicNavigatorContext } from "../../../../../providers/MusicNavigationProvider"
import { useDraggable } from "@dnd-kit/core"
import { VisualRaterButton } from "../../../../common/VisRaterButton"
import { AlbumsSubpanel } from "./AlbumsSubpanel"

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
                      <VisualRaterButton onClick={() => raterAction(artist)} >
                       {isOnRater(artist) ? '-': '+'}  
                       </VisualRaterButton> 
                      <VisualRaterButton onClick={(e:React.MouseEvent) => onOverviewClick(artist, e)}>O</VisualRaterButton> 
                      <VisualRaterButton animate={{rotate:isExpanded ? 90 : 0}} onClick={(_) => onArtistSelect(artist)} >{'>'}</VisualRaterButton> 
                    </div> 
                    <img {...listeners} {...attributes}  ref={setNodeRef} className="nav-panel-item-thumbnail" src={artist.thumbnail!} />
                    <div className="nav-panel-item-info">
                        <div className="nav-panel-item-info-name">{artist.name} </div>
                    </div>
                    <NavScoreInfo item={artist} type="artist" />
                </div> 
                  { isExpanded && 
                      <AlbumsSubpanel key={"artist-"+artist.id+"-details"} dispatchAlbumToRater={(album, shouldRemove) => dispatchToRater({ artist, albumId: album.id}, shouldRemove)} artist={artist} />    
                  } 
                </li> 
}