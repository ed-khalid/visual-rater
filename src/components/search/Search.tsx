import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AlbumSearchResult, ArtistSearchResult, useSearchByArtistLazyQuery } from "../../generated/graphql";
import { SearchInputField } from "./SearchInputField";
import { SearchResults } from "./SearchResults";
import './Search.css'

interface Props {
    onAlbumSelect:Dispatch<SetStateAction<AlbumSearchResult|undefined>>
    onArtistSelect:Dispatch<SetStateAction<ArtistSearchResult|undefined>>
    album:AlbumSearchResult|undefined
    artist:ArtistSearchResult|undefined
}

export const Search = ({onAlbumSelect, album, artist, onArtistSelect}:Props) => {
  const [searchArtist,  { data, error ,loading } ]  = useSearchByArtistLazyQuery()    
  const [artistName, setArtistName] = useState<string>('')

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
        onArtistSelect(data.search.artist)
      }
  }, [data,  onArtistSelect])

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