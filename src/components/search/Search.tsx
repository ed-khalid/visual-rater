import React, { useEffect, useState } from "react";
import { AlbumSearchResult, Artist, ArtistSearchResult, useSearchByArtistLazyQuery } from "../../generated/graphql";
import { SearchInputField } from "./SearchInputField";
import { SearchResults } from "./SearchResults";
import './Search.css'

interface Props {
    onAlbumSelect:any;
    onArtistSelect:any;
    album:AlbumSearchResult|undefined
    artist:ArtistSearchResult|undefined
    existingArtist:Artist|undefined
}

export const Search = ({onAlbumSelect, album, artist, existingArtist, onArtistSelect}:Props) => {
  const [searchArtist,  { data, error ,loading } ]  = useSearchByArtistLazyQuery()    
  const [artistName, setArtistName] = useState<string>('')


  const updateArtistName = (name:string) => {
        if (!name.length) {
            setArtistName('')
            onArtistSelect(undefined)
        } else {
          setArtistName(name)
          if ( name.length > 2) {
            searchArtist({ variables: { name:  name.toLowerCase()}})
          }
        }
  }

  useEffect(() => {
      if (data?.search?.artist) {
        onArtistSelect(data.search.artist)
      }
  }, [data?.search?.artist, onArtistSelect])

  return <div id="search" className="grid">
        <SearchInputField value={artistName} onInputFieldChange={updateArtistName}></SearchInputField>
        <div id="artist-col">
            {artistName && loading && <p>Loading...</p> }
            {artistName && error && <p>Error!</p> }
            {
            (artist) && 
                    <SearchResults searchArtist={artist} searchAlbum={album} existingArtist={existingArtist} setSearchAlbum={onAlbumSelect}></SearchResults>
            }
        </div> 
  </div>

}