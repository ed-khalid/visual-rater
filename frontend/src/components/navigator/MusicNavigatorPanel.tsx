import { Dispatch, useState } from "react"
import { Artist } from "../../generated/graphql"
import { MusicAction } from "../../music/MusicAction"
import { RaterEntityRequest } from "../../models/RaterTypes"
import { ArtistDetails } from "./ArtistDetails"
import { Panel } from "../common/Panel"
import { MusicState } from "../../music/MusicState"
import { MusicStore } from "../../music/MusicStore"
import { NavScoreInfo } from "./NavScoreInfo"
import { FilterMode } from "../../music/MusicFilters"

interface Props {
    artists: Artist[]
    musicState: MusicState
    musicDispatch: Dispatch<MusicAction>
    dispatchToRater: (entity:RaterEntityRequest, shouldRemove:boolean) => void 
}

export const MusicNavigatorPanel = ({musicDispatch, musicState, artists, dispatchToRater}: Props) => {
  const store = new MusicStore(musicState)   

  const sortedArtists = [...artists].sort((a,b) => b.score - a.score)  
  const expandedArtistIds = store.navigationFilters.map(it => it.artistId)   


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
    const raterArtists = new MusicStore(musicState).getFatSongs()
    return raterArtists.some(it => it.artist.id === artist.id)
  }

  return <Panel className="nav-panel" title="Artists" >
     
        <ul id="artists-list">
                {sortedArtists.map(artist => <li key={'artists-panel-item-' + artist.id}>
                <div className="nav-panel-item">
                    <div className="nav-item-controls" onClick={() => onAction(artist)}>
                       { isOnRater(artist)? '-' : '+' }
                    </div> 
                    <img className="nav-panel-item-thumbnail" src={artist.thumbnail!} />
                    <div className="nav-panel-item-info">
                        <div onClick={() => onArtistSelect(artist)} className="nav-panel-item-info-name">{artist.name} </div>
                    </div>
                    <NavScoreInfo item={artist} type="artist" />
                </div> 
                  { expandedArtistIds.includes(artist.id) && 
                      <ArtistDetails musicState={musicState} key={"artist-"+artist.id+"-details"} musicDispatch={musicDispatch} dispatchAlbumToRater={(album, shouldRemove) => dispatchToRater({ artist, albumId: album.id}, shouldRemove)} artist={artist} />    
                  } 
                </li> 
              )}
        </ul>
  </Panel>

}