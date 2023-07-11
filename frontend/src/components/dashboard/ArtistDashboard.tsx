import React, { useState } from "react"
import { Album, Artist, Maybe } from "../../generated/graphql"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons' 
import { ArtistDashboardAlbumRow } from "./ArtistDashboardAlbumRow"
import './Dashboard.css'
interface DashboardArtistProps {
    artist:Artist
    onAlbumSelect:(album:Album, artist:Artist) => void 
}

export const  DashboardArtist = ({artist,  onAlbumSelect}: DashboardArtistProps) => {
    const ALBUMS_PER_ARTIST = 6 
    const [pageNumber, setPageNumber] = useState<number>(1) 
    const thumbnail = artist.thumbnail || ''  

    const onAlbumSelectInternal = (album:Album) => {
        onAlbumSelect(album, artist)
    } 

    const sortAlbums =(albums?:Maybe<Album>[]|null) : Maybe<Album>[] => {
        if (albums) {
            return [...albums].sort(byYear)
        }
        return []
    }


    const byYear=(a:Maybe<Album>,b:Maybe<Album>) : number  => {
        if (a && b && a.year && b.year) {
            if (a.year < b.year) {
                return -1;
            }
            if (a.year > b.year) {
                return 1;
            }
        }
        return 0; 
    } 

    return <div className="artist-dashboard flex">
        <div className="artist-banner flex">
                <div className="artist-thumbnail">
                        <img alt={artist.name} className="artist-thumbnail" src={thumbnail}></img>
                </div>
                <div className="artist-title"><div className="font-title">{artist.name}</div></div>
        </div>
         
                <div className="dashboard-albums flex">
                        {  (artist.albums!.length > ALBUMS_PER_ARTIST) &&  <div className={`dashboard-albums-navigation flex-column ${(pageNumber === 1) ? 'disabled': '' }`} >
                            <FontAwesomeIcon onClick={() => setPageNumber(pageNumber-1)} icon={faArrowLeft}></FontAwesomeIcon>
                        </div>}
                        <div className="dashboard-albums-content flex">
                            {sortAlbums(artist.albums).slice(ALBUMS_PER_ARTIST *(pageNumber-1), Math.min(pageNumber *(ALBUMS_PER_ARTIST), artist.albums!.length) ).map(album => 
                            (album) ?  <ArtistDashboardAlbumRow key={album.id} album={album} onAlbumSelect={onAlbumSelectInternal}/>
                            : <div>nothing</div> 
                            )}
                        </div>
                        { (artist.albums!.length > ALBUMS_PER_ARTIST) && <div className={`dashboard-albums-navigation flex-column ${pageNumber*ALBUMS_PER_ARTIST >= artist?.albums!.length? "disabled":"" }`}>
                            <FontAwesomeIcon onClick={() => setPageNumber(pageNumber+1)} icon={faArrowRight}></FontAwesomeIcon>
                        </div>}
                </div>
    </div>

} 