import React, { useState } from "react"
import { Album, Artist, Maybe } from "../../generated/graphql"
import { Panel } from "./Panel"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { ArtistDashboardAlbumRow } from "../dashboard/ArtistDashboardAlbumRow"

interface Props {
    artist:Artist
    onAlbumSelect:(album:Album, artist:Artist) => void 
}


export const ArtistAlbumsPanel =  ({artist, onAlbumSelect}:Props) => {
    const ALBUMS_PER_ARTIST = 6 
    const [pageNumber, setPageNumber] = useState<number>(1)
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

    return <Panel className='rightside-panel artist-albums' title={artist.name}>
                <div className="albums">
                    {sortAlbums(artist.albums).map(album => 
                        <div onClick={() => onAlbumSelectInternal(album!)} className="album">
                            <div className="album-thumbnail">
                                <img src={album!.thumbnail!} alt={''}/>
                            </div>
                            <div className="album-title">
                                {album!.name}
                            </div>
                        </div>)
                        }
                    
                        {/* {  (artist.albums!.length > ALBUMS_PER_ARTIST) &&  <div className={`dashboard-albums-navigation flex-column ${(pageNumber === 1) ? 'disabled': '' }`} >
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
                        </div>} */}
                </div>
    </Panel>

}