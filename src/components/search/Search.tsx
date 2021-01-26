import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AlbumSearchResult, ArtistSearchResult, useSearchByArtistLazyQuery } from "../../generated/graphql";
import { SearchInputField } from "./SearchInputField";
import { SearchResults } from "./SearchResults";
import './Search.css'

interface Props {
    onAlbumSelect:Dispatch<SetStateAction<AlbumSearchResult|undefined>>
    album:AlbumSearchResult|undefined
}

export const Search = ({onAlbumSelect, album}:Props) => {
  const [searchArtist,  { data, error ,loading } ]  = useSearchByArtistLazyQuery()    
  const [artistName, setArtistName] = useState<string>('')
  const [artist, setArtist] = useState<ArtistSearchResult>()

  useEffect(() => {
        if (!artistName.length) {
            setArtistName('')
        }
        if ( artistName.length > 2) {
            searchArtist({ variables: { name:  artistName.toLowerCase()}})
        }
  }, [artistName, searchArtist])
  useEffect(() => {
      if (data?.search?.artist) {
        setArtist(data.search.artist)
      }
  }, [data,  setArtist])

  return <div id="search" className="grid">
        <SearchInputField value={artistName} onInputFieldChange={setArtistName}></SearchInputField>
        <div id="artist-col">
            {loading && <p>Loading...</p> }
            {error && <p>Error!</p> }
            {
            (artist) && 
                    <SearchResults searchArtist={artist} searchAlbum={album} setSearchAlbum={onAlbumSelect}></SearchResults>
            }
        </div> 
  </div>

}