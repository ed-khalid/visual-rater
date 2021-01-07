import React from "react"
import './ArtistDashboard.css'
import { Album, Artist } from "../../generated/graphql"

interface DashboardArtistProps {
    artist:Artist
    onAlbumSelect:(album:Album, artist:Artist) => void 
}

export const  DashboardArtist = ({artist, onAlbumSelect}: DashboardArtistProps) => {
    const ALBUMS_PER_ARTIST = 5 
    const pageNumber = 1
    const thumbnail = artist.thumbnail || ''  
    return <div className="artist-dashboard flex">
        <div>
                <img alt={artist.name} className="artist-thumbnail" src={thumbnail}></img>
        </div>
                <div className="artist-title font-title" key={"artist" + artist.id}>{artist.name}</div>
                <div className="dashboard-albums flex">
                        {artist.albums?.slice(ALBUMS_PER_ARTIST *(pageNumber-1), Math.min(pageNumber *(ALBUMS_PER_ARTIST), artist.albums?.length) ).map(album => 
                        (album) ? <div key={album.id} onClick={() => onAlbumSelect(album, artist) } className="dashboard-album">
                            <img alt={album?.name} src={album?.thumbnail || ''} />
                        </div> : null 
                        )}
                </div>
    </div>

} 