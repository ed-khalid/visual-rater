import { Artist } from "../../../../generated/graphql"
import { RaterEntityRequest } from "../../../../models/RaterTypes"
import { ArtistDetails } from "./ArtistDetails"
import { Panel } from "../../../common/Panel"
import { NavScoreInfo } from "../NavScoreInfo"
import { FilterMode } from "../../../../music/MusicFilters"
import { useMusicDispatch, useMusicStateOperator } from "../../../../hooks/MusicStateHooks"

interface Props {
    artists: Artist[]
    dispatchToRater: (entity:RaterEntityRequest, shouldRemove:boolean) => void 
    openArtistOverview : (artist:Artist) => void
}

export const MusicNavigatorPanel = ({artists, dispatchToRater, openArtistOverview}: Props) => {
  const musicDispatch = useMusicDispatch()
  const musicStateOperator = useMusicStateOperator() 

  const sortedArtists = [...artists].sort((a,b) => b.score - a.score)  
  const expandedArtistIds = musicStateOperator.navigationFilters.map(it => it.artistId)   

  const onArtistNameClick = (artist:Artist, e:React.MouseEvent) => {
    e.stopPropagation()
    openArtistOverview(artist)
  }


  const onArtistSelect = (artist:Artist) => {
    (expandedArtistIds.includes(artist.id)) ?  
      musicDispatch({type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId: artist.id, mode: FilterMode.REDUCTIVE }) :
      musicDispatch({type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId: artist.id, mode: FilterMode.ADDITIVE }) 
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

  return <Panel id="left-nav" className="nav-panel" collapseDirection="left" isCollapsible={true} title="Artists" >
        <ul id="artists-list">
                {sortedArtists.map(artist => <li key={'artists-panel-item-' + artist.id}>
                <div className="nav-panel-item" onClick={() => onArtistSelect(artist)}>
                    <div className="nav-item-controls" onClick={() => onAction(artist)}>
                       { isOnRater(artist)? '-' : '+' }
                    </div> 
                    <img className="nav-panel-item-thumbnail" src={artist.thumbnail!} />
                    <div className="nav-panel-item-info">
                        <div onClick={(e) => onArtistNameClick(artist, e)} className="nav-panel-item-info-name">{artist.name} </div>
                    </div>
                    <NavScoreInfo item={artist} type="artist" />
                </div> 
                  { expandedArtistIds.includes(artist.id) && 
                      <ArtistDetails key={"artist-"+artist.id+"-details"} dispatchAlbumToRater={(album, shouldRemove) => dispatchToRater({ artist, albumId: album.id}, shouldRemove)} artist={artist} />    
                  } 
                </li> 
              )}
        </ul>
  </Panel>

}