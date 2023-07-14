import React, { useState } from "react";
import { ExternalAlbumSearchResult, ExternalArtistSearchResult } from "../../../generated/graphql";
import './SearchResults.css'
import { ListControlNav } from "../../ListControlNav";

interface Props {
    searchArtist:ExternalArtistSearchResult|undefined
    setSearchAlbum:(artist:ExternalArtistSearchResult|undefined, album:ExternalAlbumSearchResult|undefined) => void
} 

export const SearchResults =  ({searchArtist, setSearchAlbum}:Props) => {
    const ALBUMS_PER_PAGE = 8;   
    const [pageNumber,setPageNumber] = useState<number>(1);   

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

    const getNumberOfAlbums = (searchArtist:ExternalArtistSearchResult) => {
        return Math.ceil((searchArtist.albums.length) / ALBUMS_PER_PAGE)
    }


    let numberOfPages = 0; 
    if (searchArtist) {
        numberOfPages = getNumberOfAlbums(searchArtist) 
        const thumbnail = searchArtist.thumbnail || ''  
        const artistDivStyle = {
            "backgroundImage" : `url(${thumbnail})`,
        }    
        return (
            <React.Fragment>
                <div id="artist" className="wrapper" style={artistDivStyle}>
                    <div id="artist-title" className="font-title" key={"artist" + searchArtist.id}>{searchArtist.name}</div>
                    <div id="albums" className="grid album-row" >
                            {searchArtist.albums.slice(ALBUMS_PER_PAGE *(pageNumber-1), Math.min(pageNumber *(ALBUMS_PER_PAGE), searchArtist.albums.length) ).map(album => 
                            <div className={"album-result"} key={album.id}>
                                <img alt={album.name} onClick={() => onAlbumClick(album)} src={album.thumbnail || '' } />
                            </div>
                            )}
                    </div>
                </div>
                <ListControlNav setPageNumber={setPageNumber} numberOfPages={numberOfPages}></ListControlNav>
            </React.Fragment>
        )
    }
    return <div></div>

}  