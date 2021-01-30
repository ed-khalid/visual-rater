import React, { useState } from "react";
import { AlbumSearchResult, Artist, ArtistSearchResult } from "../../generated/graphql";
import './SearchResults.css'
import { ListControlNav } from "../ListControlNav";

interface Props {
    searchAlbum:AlbumSearchResult|undefined
    searchArtist:ArtistSearchResult|undefined
    setSearchAlbum:(album:AlbumSearchResult|undefined) => void
    existingArtist:Artist|undefined
} 

export const SearchResults =  ({searchArtist, searchAlbum, setSearchAlbum, existingArtist}:Props) => {
    const ALBUMS_PER_PAGE = 8;   
    const [pageNumber,setPageNumber] = useState<number>(1);   

    const isAlbumDisabled = (album:AlbumSearchResult) : boolean => {
        const a = existingArtist?.albums?.find(it => it?.vendorId === album.id )   
        return !!a
    }  

    const onAlbumClick = (album:AlbumSearchResult) => {
        if (isAlbumDisabled(album)) {
            return;
        } else {
          setSearchAlbum(album)
        }
    } 


    let numberOfPages = 0; 
    if (searchArtist) {
        numberOfPages = (searchArtist.albums) ? Math.ceil((searchArtist.albums.length/ ALBUMS_PER_PAGE)) : 0; 
        const thumbnail = searchArtist.thumbnail || ''  
        const artistDivStyle = {
            "backgroundImage" : `url(${thumbnail})`,
        }    
        return (
            <React.Fragment>
                <div id="artist" className="wrapper" style={artistDivStyle}>
                    <div id="artist-title" className="font-title" key={"artist" + searchArtist.id}>{searchArtist.name}</div>
                    <div id="albums" className="grid" >
                            {searchArtist.albums?.slice(ALBUMS_PER_PAGE *(pageNumber-1), Math.min(pageNumber *(ALBUMS_PER_PAGE), searchArtist.albums?.length) ).map(album => 
                            <div onClick={() => onAlbumClick(album) } className={"album-result " + ((searchAlbum === album) ? " selected " : "" + ((isAlbumDisabled(album)) ? "disabled" : "")  )} key={album.id}>
                                <img alt={album.name} src={album.thumbnail} />
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