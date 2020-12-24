import React, { ChangeEvent, useEffect, useState } from "react"
import './Search.css'
import { useSearchByArtistQuery, useSearchAlbumsByArtistQuery , useGetTracksForAlbumLazyQuery, AlbumSearchResult, ArtistSearchResult, Album, Artist } from '../generated/graphql'; 
import { Song } from "../models/music/Song";
import { mapper } from "../functions/mapper";

export const Search = ({setUnrated}:{setUnrated:any}) => {

  const [artistName, setArtistName] = useState<string|null>(null);   
  const [chosenArtist, setChosenArtist] = useState<ArtistSearchResult|null>(null); 
  const [chosenAlbum, setChosenAlbum] = useState<AlbumSearchResult|null>(null); 
  const [getTracks, tracks ] = useGetTracksForAlbumLazyQuery();  

    useEffect(() => {
        if (tracks.data?.search?.tracks && chosenAlbum && chosenArtist) {
            const album = mapper.searchResultToResult<Album>(chosenAlbum)
            const artist = mapper.searchResultToResult<Artist>(chosenArtist)
            const unratedSongs:Song[] = tracks.data.search.tracks.map(track => new Song(track.id, track.name, artist , album, track.trackNumber))
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
        }
    }
    const showAlbums = (artist:ArtistSearchResult) => {
        setChosenArtist(artist);
    }
    const showTracks =  (album:AlbumSearchResult) => {
        setChosenAlbum(album);
        getTracks({ variables: { albumId: album.id  } })
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
                    <div>
                    <div id="chosen-album" className="wrapper result">
                        <div className="result-row">
                            <img alt="" src={chosenAlbum.images[0].url} />
                            <div>{chosenAlbum.name}</div>
                        </div>
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

export const SearchAlbumsForArtist  = ({ onSelectAlbum, artist}:{onSelectAlbum:(album:AlbumSearchResult) => void, artist:ArtistSearchResult}) => {
        let [pageNumber, setPageNumber] = useState<number>(0); 
        const { data }  = useSearchAlbumsByArtistQuery({variables: { artistId: artist.id, pageNumber }})
        const offset = (shouldIncrement:boolean) => {
            if (shouldIncrement) {
                setPageNumber(pageNumber+1);
            } else {
                setPageNumber(pageNumber-1);
            }
        } 

        return <div id="album-nav-grid">
                <ul>
                    {data?.search?.albums?.results?.map(album => 
                    <li onClick={() => onSelectAlbum(album) }  key={album.id} >
                            <img alt="" src={album.images[2].url} />
                            <span>{album.name}</span>
                    </li>
                    )}
                </ul>
                <nav id="album-navbar" className="grid">
                    <div onClick={() => { offset(false) }}   className="nav-arrow">&lt;</div>
                    <div onClick={() => { offset(true)  }}   className="nav-arrow">&gt;</div>
                </nav>
        </div>
}

export const SearchQuery =  ({onSelectArtist, artist}:{onSelectArtist: (artist:ArtistSearchResult) => void, artist:string}) => {
    const { loading, error, data  } = useSearchByArtistQuery({ variables: { name:  artist}})
    if (loading) return <p>Loading...</p> 
    if (error) return <p>Error! </p>
    if (data && data.search?.artists) {
        const mostPopular = data.search?.artists[0];  
        let image;
        if (mostPopular && mostPopular.images) {
            image = mostPopular.images[2]; 
        }
        return (<div onClick={() => onSelectArtist(mostPopular)} className="result-row" >
            <img alt="" src={image?.url}></img>
            <div key={"artist" + mostPopular?.id}>{mostPopular?.name}</div>
        </div>)
    }
    return <div></div>

}  
