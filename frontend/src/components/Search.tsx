import React, { ChangeEvent, useState } from "react"
import './Search.css'
import { useSearchByArtistQuery, useSearchAlbumsByArtistQuery, SearchResult } from '../generated/graphql'; 
import { stackOffsetDiverging } from "d3";

export const Search = () => {

    let [artistName, setArtistName] = useState<string|null>(null);   
    let [chosenArtist, setChosenArtist] = useState<SearchResult|null>(null); 
    let [chosenAlbum, setChosenAlbum] = useState<SearchResult|null>(null); 
    const handleArtist = (evt:ChangeEvent<HTMLInputElement>) => {
        const val = evt.target.value; 
        if (val.length > 2) {
            setArtistName(val);
        }
        if (val.length == 0) {
            setArtistName(null);
            setChosenArtist(null);
            setChosenAlbum(null);
        }
    }
    const showAlbums = (artist:SearchResult) => {
        setChosenArtist(artist);
    }
    const showTracks =  (album:SearchResult) => {
        setChosenAlbum(album);
    }



    return (
        <div id="search" className="grid">
            <div id="artist-col">
                <div id="search-input" className="wrapper">
                    <div className="flex">
                        <div id="artist" className="flex-row">
                            <div className="title">Artist</div>
                            <input type="text" onChange={handleArtist}></input>
                        </div> 
                    </div>
                </div>
                {
                artistName && (artistName.length) > 2 && 
                    <div id="artist-result" className="wrapper result">
                        <SearchQuery onSelectArtist={showAlbums} artist={artistName}></SearchQuery>
                    </div>
                    
                }
                {
                    chosenAlbum && 
                    <div id="chosen-album" className="wrapper result">
                        <div className="result-row">
                            <img src={chosenAlbum.images[0].url} />
                            <div>{chosenAlbum.name}</div>
                        </div>
                    </div>
                }
            </div> 

            { chosenArtist && !chosenAlbum && 
            <div id="album-result" className="wrapper result">
                <SearchAlbumsForArtist onSelectAlbum={showTracks} artist={chosenArtist} ></SearchAlbumsForArtist>
            </div>
            }
        </div>
    )
}  

export const SearchAlbumsForArtist  = ({ onSelectAlbum, artist}:{onSelectAlbum:(album:SearchResult) => void, artist:SearchResult}) => {
        let [pageNumber, setPageNumber] = useState<number>(0); 
        const { loading, data, error }  = useSearchAlbumsByArtistQuery({variables: { artistId: artist.id, pageNumber }})
        console.log(data);
        const offset = (shouldIncrement:boolean) => {
            if (shouldIncrement) {
                setPageNumber(pageNumber+1);
            } else {
                setPageNumber(pageNumber-1);
            }
        } 

        return <div id="album-nav-grid">
                <ul>
                    
                    {data?.album?.results?.map(album => 
                    <li onClick={() => onSelectAlbum(album) }  key={album.id} >
                            <img src={album.images[2].url} />
                            <span>{album.name}</span>
                    </li>
                    )}
                </ul>
                <nav id="album-navbar" className="grid">
                    <div onClick={() => { offset(false) } } className="nav-arrow">&lt;</div>
                    <div onClick={() => { offset(true) }} className="nav-arrow">&gt;</div>
                </nav>
        </div>
}


export const SearchQuery =  ({onSelectArtist, artist}:{onSelectArtist: (artist:SearchResult) => void, artist:string}) => {
    const { loading, error, data  } = useSearchByArtistQuery({ variables: { name:  artist}})
    if (loading) return <p>Loading...</p> 
    if (error) return <p>Error! </p>
    if (data && data.artist) {
        const mostPopular = data.artist[0];  
        let image;
        if (mostPopular && mostPopular.images) {
            image = mostPopular.images[2]; 
        }
        return (<div onClick={() => onSelectArtist(mostPopular)} className="result-row" >
            <img src={image?.url}></img>
            <div key={"artist" + mostPopular?.id}>{mostPopular?.name}</div>
        </div>)
    }
    return <div></div>

}  
