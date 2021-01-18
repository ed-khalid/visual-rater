import React, { useState } from "react";
import { AlbumSearchResult, ArtistSearchResult } from "../../generated/graphql";
import './SearchResults.css'
import { ListControlNav } from "../ListControlNav";

interface Props {
    searchAlbum:AlbumSearchResult|undefined
    searchArtist:ArtistSearchResult|undefined
    setSearchAlbum:(album:AlbumSearchResult|undefined) => void
} 

export const SearchResults =  ({searchArtist: chosenArtist, searchAlbum: chosenAlbum, setSearchAlbum: setChosenAlbum}:Props) => {
    const ALBUMS_PER_PAGE = 8;   
    const [pageNumber,setPageNumber] = useState<number>(1);   

    const handleAlbumDrag = (album:AlbumSearchResult) => {
        setChosenAlbum(album)
    }

    let numberOfPages = 0; 
    if (chosenArtist) {
        numberOfPages = (chosenArtist.albums) ? Math.ceil((chosenArtist.albums.length/ ALBUMS_PER_PAGE)) : 0; 
        const thumbnail = chosenArtist.thumbnail || ''  
        const artistDivStyle = {
            "backgroundImage" : `url(${thumbnail})`,
            "backgroundSize" : "100% 100%" 
        }    
        return (
            <div>
                <div id="artist" className="wrapper result" style={artistDivStyle}>
                    <div id="artist-title" className="font-title" key={"artist" + chosenArtist.id}>{chosenArtist.name}</div>
                    <div id="albums" className="grid" >
                            {chosenArtist.albums?.slice(ALBUMS_PER_PAGE *(pageNumber-1), Math.min(pageNumber *(ALBUMS_PER_PAGE), chosenArtist.albums?.length) ).map(album => 
                            <div onDrag={() => handleAlbumDrag(album)} onClick={() => setChosenAlbum(album) } className={"album-result " + ((chosenAlbum === album) ? "selected" : "")   } key={album.id}>
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