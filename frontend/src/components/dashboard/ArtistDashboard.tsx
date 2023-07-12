import React, { useState } from "react"
import { Album, Artist, Maybe } from "../../generated/graphql"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons' 
import { ArtistDashboardAlbumRow } from "./ArtistDashboardAlbumRow"
import './Dashboard.css'
interface DashboardArtistProps {
    artist:Artist
}

export const  DashboardArtist = ({artist}: DashboardArtistProps) => {
    const ALBUMS_PER_ARTIST = 6 
    const [pageNumber, setPageNumber] = useState<number>(1) 
    const thumbnail = artist.thumbnail || ''  
    return <div className="artist-dashboard flex">
        <div className="artist-banner flex">
                <div className="artist-thumbnail">
                        <img alt={artist.name} className="artist-thumbnail" src={thumbnail}></img>
                </div>
                <div className="artist-title"><div className="font-title">{artist.name}</div></div>
        </div>
    </div>
} 