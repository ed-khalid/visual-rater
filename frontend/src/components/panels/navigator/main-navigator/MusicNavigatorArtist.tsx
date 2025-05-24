import { useContext } from "react"
import { Artist } from "../../../../generated/graphql"
import { useMusicStateOperator } from "../../../../hooks/MusicStateHooks"
import { NavScoreInfo } from "../NavScoreInfo"
import { ArtistDetails } from "./ArtistDetails"
import { MusicNavigatorContext } from "../../../../providers/MusicNavigationProvider"
import { useDraggable } from "@dnd-kit/core"

interface Props {
    artist:Artist
    onArtistSelect:any
    isExpanded:boolean
}

export const MusicNavigatorArtist = ({artist, onArtistSelect, isExpanded}:Props) => {

    const { openArtistOverview, dispatchToRater } = useContext(MusicNavigatorContext) 

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

  const onArtistNameClick = (artist:Artist, e:React.MouseEvent) => {
    e.stopPropagation()
    openArtistOverview(artist)
  }

  const onAction = (artist:Artist) => {
    const shouldRemove = isOnRater(artist)
    dispatchToRater({
      artist: artist,
    }, shouldRemove)
  }

  const isOnRater = (artist:Artist) => {
    const raterArtists = musicStateOperator.getFatSongs()
    return raterArtists.some(it => it.artist.id === artist.id)
  }

                return <li  key={'artists-panel-item-' + artist.id}>
                <div className="nav-panel-item" >
                    <div className="nav-item-controls" onClick={() => onAction(artist)}>
                       { isOnRater(artist)? '-' : '+' }
                    </div> 
                    <img {...listeners} {...attributes}  ref={setNodeRef} className="nav-panel-item-thumbnail" src={artist.thumbnail!} />
                    <div onClick={() => onArtistSelect(artist)}className="nav-panel-item-info">
                        <div className="nav-panel-item-info-name">{artist.name} </div>
                    </div>
                    <NavScoreInfo item={artist} type="artist" />
                </div> 
                  { isExpanded && 
                      <ArtistDetails key={"artist-"+artist.id+"-details"} dispatchAlbumToRater={(album, shouldRemove) => dispatchToRater({ artist, albumId: album.id}, shouldRemove)} artist={artist} />    
                  } 
                </li> 
}