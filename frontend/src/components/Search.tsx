import React, { ChangeEvent, useState } from "react"
import './Search.css'
import { useSearchByArtistQuery, useSearchAlbumsByArtistQuery, SearchResult } from '../generated/graphql'; 

export const Search = () => {

    let [artistName, setArtistName] = useState<string|null>(null);   
    let [chosenArtist, setChosenArtist] = useState<SearchResult|null>(null); 
    const handleArtist = (evt:ChangeEvent<HTMLInputElement>) => {
        const val = evt.target.value; 
        if (val.length > 2) {
            setArtistName(val);
        }
        if (val.length == 0) {
            setArtistName(null);
            setChosenArtist(null);
        }
    }
    const showAlbums = (artist:SearchResult) => {
        setChosenArtist(artist);
    }


    return (
        <div id="search" className="grid">
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
            { chosenArtist && 
            <div id="album-result" className="wrapper result">
                <SearchAlbumsForArtist artist={chosenArtist} ></SearchAlbumsForArtist>
            </div>
            }
        </div>
    )
}  

export const SearchAlbumsForArtist  = ({artist}:{artist:SearchResult}) => {
        const { loading, data, error }  = useSearchAlbumsByArtistQuery({variables: { artistId: artist.id} })
        console.log(data);
        return <ul>
            {data?.album?.results?.map(album => 
            <li key={album.id} >{album.name}
              <img src={album?.images?[0]} />
            </li> )}
            </ul>
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
