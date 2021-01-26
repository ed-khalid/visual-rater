import React, { useState } from "react";
import { AlbumSearchResult, ArtistSearchResult } from "../../generated/graphql";
import './SearchResults.css'
import { ListControlNav } from "../ListControlNav";

interface Props {
    searchAlbum:AlbumSearchResult|undefined
    searchArtist:ArtistSearchResult|undefined
    setSearchAlbum:(album:AlbumSearchResult|undefined) => void
} 

export const SearchResults =  ({searchArtist, searchAlbum, setSearchAlbum}:Props) => {
    const ALBUMS_PER_PAGE = 8;   
    const [pageNumber,setPageNumber] = useState<number>(1);   

    let numberOfPages = 0; 
    if (searchArtist) {
        numberOfPages = (searchArtist.albums) ? Math.ceil((searchArtist.albums.length/ ALBUMS_PER_PAGE)) : 0; 
        const thumbnail = searchArtist.thumbnail || ''  
        const artistDivStyle = {
            "backgroundImage" : `url(${thumbnail})`,
            "backgroundSize" : "100% 100%" 
        }    
        return (
            <div>
                <div id="artist" className="wrapper result" style={artistDivStyle}>
                    <div id="artist-title" className="font-title" key={"artist" + searchArtist.id}>{searchArtist.name}</div>
                    <div id="albums" className="grid" >
                            {searchArtist.albums?.slice(ALBUMS_PER_PAGE *(pageNumber-1), Math.min(pageNumber *(ALBUMS_PER_PAGE), searchArtist.albums?.length) ).map(album => 
                            <div onClick={() => setSearchAlbum(album) } className={"album-result " + ((searchAlbum === album) ? "selected" : "")   } key={album.id}>
                                <img alt={album.name} src={album.thumbnail} />
                            </div>
                            )}
                    </div>
                </div>
                <ListControlNav setPageNumber={setPageNumber} numberOfPages={numberOfPages}></ListControlNav>
            </div>
        )
    }
    return <div></div>

}  