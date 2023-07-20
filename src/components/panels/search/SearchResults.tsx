import React from "react";
import { ExternalAlbumSearchResult, ExternalArtistSearchResult } from "../../../generated/graphql";

interface Props {
    searchArtist:ExternalArtistSearchResult|undefined
    setSearchAlbum:(artist:ExternalArtistSearchResult|undefined, album:ExternalAlbumSearchResult|undefined) => void
} 

export const SearchResults =  ({searchArtist, setSearchAlbum}:Props) => {

    const isAlbumDisabled = (album:ExternalAlbumSearchResult) : boolean => {
        return false;
    }  

    const onAlbumClick = (album:ExternalAlbumSearchResult) => {
        if (isAlbumDisabled(album)) {
            return;
        } else {
          setSearchAlbum(searchArtist,album)
        }
    } 

    if (searchArtist) {
        return (
            <React.Fragment>
                <div id="search-results-artist" className="flex-column">
                    <div id="search-results-artist-thumbnail">
                        <img className="search-results-artist-thumbnail" src={searchArtist.thumbnail || ''} alt={""} /> 
                    </div> 
                    <div id="search-results-artist-title" className="font-title" key={"external-artist" + searchArtist.name}>
                        {searchArtist.name}
                     </div>
                    <div id="search-results-artist-albums" className="grid album-row" >
                            {searchArtist.albums.map(album => 
                            <div className="search-result-album" key={'external-album'+album.name}>
                                <div className="search-result-album-thumbnail">
                                   <img alt={album.name} onClick={() => onAlbumClick(album)} src={album.thumbnail || '' } />
                                </div>
                                <div className="search-result-album-name">{album.name}</div>
                                <div className="search-result-album-year">{album.year}</div>
                            </div>
                            )}
                    </div>
                </div>
            </React.Fragment>
        )
    }
    return <div></div>

}  