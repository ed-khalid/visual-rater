import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react"
import './Search.css'
import { useSearchByArtistQuery, AlbumSearchResult, ArtistSearchResult } from '../generated/graphql'; 
import { ListControlNav } from "./ListControlNav";

interface SearchProps {
    setDraggedAlbum:Dispatch<SetStateAction<AlbumSearchResult|undefined>>
    chosenAlbum:AlbumSearchResult|undefined
    setChosenAlbum:(album:AlbumSearchResult|undefined) => void
    setChosenArtist:Dispatch<SetStateAction<ArtistSearchResult|undefined>>
    setUnrated:any
}



export const Search = (props:SearchProps) => {

  const [artistName, setArtistName] = useState<string|undefined>(undefined);   

  const handleArtist = (evt:ChangeEvent<HTMLInputElement>) => {
        const val = evt.target.value; 
        if (val.length > 2) {
            setArtistName(val);
        }
        if (val.length === 0) {
            setArtistName(undefined);
            props.setChosenArtist(undefined);
            props.setChosenAlbum(undefined);
            props.setUnrated([])
        }
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
                     <SearchQuery artistName={artistName} setDraggedAlbum={props.setDraggedAlbum} chosenAlbum={props.chosenAlbum} setChosenArtist={props.setChosenArtist} setChosenAlbum={props.setChosenAlbum}></SearchQuery>
                }
            </div> 
        </div>
    )
}  

interface SearchQueryProps {
    setDraggedAlbum:Dispatch<SetStateAction<AlbumSearchResult|undefined>>
    chosenAlbum:AlbumSearchResult|undefined
    artistName:string
    setChosenAlbum:(album:AlbumSearchResult|undefined) => void
    setChosenArtist:Dispatch<SetStateAction<ArtistSearchResult|undefined>>
} 

export const SearchQuery =  ({artistName , setChosenArtist, chosenAlbum, setChosenAlbum}:SearchQueryProps) => {
    const ALBUMS_PER_PAGE = 8;   
    const { loading, error, data  } = useSearchByArtistQuery({ variables: { name:  artistName}})
    const [pageNumber,setPageNumber] = useState<number>(1);   

    useEffect(() => {
        if (data &&  data.search?.artists) {
          const artist = data.search.artists 
          setChosenArtist(artist)
        }
    }, [data])

    const handleAlbumDrag = (album:AlbumSearchResult) => {
        setChosenAlbum(album)
    }


    let numberOfPages = 0; 
    if (loading) return <p>Loading...</p> 
    if (error) return <p>Error! </p>
    if (data && data.search?.artists) {
        const artist = data.search.artists 
        numberOfPages = (artist.albums) ? Math.ceil((artist.albums.length/ ALBUMS_PER_PAGE)) : 0; 
        const thumbnail = artist.thumbnail || ''  
        const artistDivStyle = {
            "backgroundImage" : `url(${thumbnail})`,
            "backgroundSize" : "100% 100%" 
        }    
        return (
            <div>
                <div id="artist" className="wrapper result" style={artistDivStyle}>
                    <div id="artist-title" className="font-title" key={"artist" + artist.id}>{artist.name}</div>
                    <div id="albums" className="grid" >
                            {artist.albums?.slice(ALBUMS_PER_PAGE *(pageNumber-1), Math.min(pageNumber *(ALBUMS_PER_PAGE), artist.albums?.length) ).map(album => 
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
