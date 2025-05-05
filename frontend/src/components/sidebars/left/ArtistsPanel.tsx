import { Dispatch, useEffect, useState } from "react"
import { mapArtistScoreToUI } from "../../../functions/scoreUI"
import { Album, Artist, Song, useGetAlbumsSongsLazyQuery } from "../../../generated/graphql"
import { MusicStore } from "../../../music/MusicStore"
import { Panel } from "../../panels/Panel"
import { ArtistAlbumsSubpanel } from "./ArtistAlbumsSubpanel"

interface Props {
    artists: Artist[]
}

export const MusicNavigatorPanel = ({artists}: Props) => {

  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([])

  const onArtistSelect = (artist:Artist) => {
    if (selectedArtists.includes(artist)) {
      const newArtists = selectedArtists.filter(it => it.id !== artist.id) 
      setSelectedArtists(newArtists)
    } else {
      const newArtists = [...selectedArtists, artist]
      setSelectedArtists(newArtists)
    }
  }

  return <Panel className="musical-panel" title="Artists" >
        <ul id="artists-list">
                {artists.map(artist => <li onClick={() => onArtistSelect(artist) } key={'artists-panel-item-' + artist.id}>
                  <div className="musical-panel-expandable-item">
                    <img src={artist.thumbnail!!} alt='?' className="musical-panel-item-thumbnail"/> 
                    <div className="musical-panel-item-info">
                      <div className="musical-panel-item-info-name">{artist.name} </div>
                    </div>
                    <div style={{background: mapArtistScoreToUI(artist.score).color}} className="musical-panel-item-info-rating">
                      <div className="musical-panel-item-info-score">
                      { 
                        mapArtistScoreToUI(artist.score).category  
                      }
                      </div>
                      <div className="musical-panel-item-info-score-descriptor">{mapArtistScoreToUI(artist.score).score}</div>
                    </div> 
                  </div>
                  { selectedArtists.includes(artist) && 
                      <ArtistAlbumsSubpanel artist={artist} />    
                  } 
                </li> 
              )}
        </ul>
  </Panel>

}