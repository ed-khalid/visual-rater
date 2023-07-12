import React from "react"
import { Artist } from "../../generated/graphql"
import './Panels.css'
import { Panel } from "./Panel"

interface Props {
    artists:Artist[]
    onArtistSelect:(artist:Artist|undefined) => void
}

export const ArtistsPanel = ({artists, onArtistSelect}:Props) => {

    return <Panel className='rightside-panel' id="artists-panel" title="Artists">
            <div>
                {artists && artists.map(artist => <div key={artist.id}>
                    <img className="artist-thumbnail" src={artist.thumbnail!} alt="" onClick={() => onArtistSelect(artist)} />
                    <div className="artist-name">{artist.name}</div>
                    </div>)}
            </div>
        </Panel>
} 