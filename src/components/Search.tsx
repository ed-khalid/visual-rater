import React, { ChangeEvent, useEffect, useState } from "react"
import './Search.css'
import { useSearchByArtistQuery, useGetTracksForAlbumLazyQuery, AlbumSearchResult, ArtistSearchResult } from '../generated/graphql'; 
import { NewSong } from "../models/music/Song";
import { ListControlNav } from "./ListControlNav";

export const Search = ({chosenAlbum,setChosenAlbum,setUnrated}:{chosenAlbum:AlbumSearchResult|null, setChosenAlbum:(album:AlbumSearchResult|null) => void, setUnrated:any}) => {

  const [artistName, setArtistName] = useState<string|null>(null);   
  const [chosenArtist, setChosenArtist] = useState<ArtistSearchResult|null>(null); 
  const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery();  

    useEffect(() => {
        if (tracks.data?.search?.tracks && chosenAlbum && chosenArtist) {
            let { albums, ...artistWithoutAlbums } = chosenArtist  
            const unratedSongs:NewSong[] = tracks.data.search.tracks.map(track =>({ vendorId:track.vendorId, name:track.name, artist:artistWithoutAlbums , album:chosenAlbum, number:track.trackNumber}))
            setUnrated(unratedSongs)
        }}, [tracks.data])

    const handleArtist = (evt:ChangeEvent<HTMLInputElement>) => {
        const val = evt.target.value; 
        if (val.length > 2) {
            setArtistName(val);
        }
        if (val.length === 0) {
            setArtistName(null);
            setChosenArtist(null);
            setChosenAlbum(null);
            setUnrated([])
        }
    }
    const showTracks =  (album:AlbumSearchResult) => {
        setChosenAlbum(album);
        console.log('firing tracks')
        getTracks({ variables: { albumId: album.vendorId  } })
    }

    return (
        <div id="search" className="grid">
            <div id="artist-col">
                <div id="search-input" className="wrapper">
                    <div className="flex">
                        <div id="search-field" className="flex-row">
                            <input type="text" onChange={handleArtist}></input>
                        </div> 
                    </div>
                </div>
                {
                artistName && (artistName.length) > 2 && 
                     <SearchQuery artist={artistName} chosenAlbum={chosenAlbum} selectArtist={setChosenArtist} selectAlbum={showTracks}></SearchQuery>
                }
            </div> 
        </div>
    )
}  

export const SearchQuery =  ({artist, selectArtist, chosenAlbum, selectAlbum}:{artist:string,chosenAlbum:AlbumSearchResult|null, selectArtist:(artist:ArtistSearchResult) => void, selectAlbum:(album:AlbumSearchResult)=> void}) => {
    const ALBUMS_PER_PAGE = 8;   
    const { loading, error, data  } = useSearchByArtistQuery({ variables: { name:  artist}})
    const [pageNumber,setPageNumber] = useState<number>(1);   
    let numberOfPages = 0; 
    if (loading) return <p>Loading...</p> 
    if (error) return <p>Error! </p>
    if (data && data.search?.artists) {
        const artist = data.search.artists 
        selectArtist(artist)
        numberOfPages = (artist.albums) ? Math.ceil((artist.albums.length/ ALBUMS_PER_PAGE)) : 0; 
        const thumbnail = artist.thumbnail || ''  
        const artistDivStyle = {
            "backgroundImage" : `url(${thumbnail})`,
            "backgroundSize" : "100% 100%" 
        }    
        return (
            <div>
                <div id="artist" className="wrapper result" style={artistDivStyle}>
                    {/* <img id="artist-pic" alt="" src={thumbnail}></img> */}
                    <div id="artist-title" className="font-title" key={"artist" + artist.vendorId}>{artist.name}</div>
                    <div id="albums" className="grid" >
                            {artist.albums?.slice(ALBUMS_PER_PAGE *(pageNumber-1), Math.min(pageNumber *(ALBUMS_PER_PAGE), artist.albums?.length) ).map(album => 
                            <div onClick={() => selectAlbum(album) } className={"album-result " + ((chosenAlbum === album) ? "selected" : "")   } key={album.vendorId}>
                                <img alt={album.name} src={album.thumbnail} />
                            </div>
                            )}
                            {}
                    </div>
                </div>
                <ListControlNav setPageNumber={setPageNumber} numberOfPages={numberOfPages}></ListControlNav>
            </div>
        )
    }
    return <div></div>

}  
