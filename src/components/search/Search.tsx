import React, { useState } from "react";
import { useSearchByArtistLazyQuery } from "../../generated/graphql";
import { SearchInputField } from "./SearchInputField";
import { SearchResults } from "./SearchResults";
import './Search.css'

interface Props {
    onAlbumSelect:any;
}

export const Search = ({onAlbumSelect}:Props) => {
  const [searchArtist,  { data, error ,loading } ]  = useSearchByArtistLazyQuery()    
  const [artistName, setArtistName] = useState<string>('')


  const updateArtistName = (name:string) => {
        if (!name.length) {
            setArtistName('')
        } else {
          setArtistName(name)
          searchArtist({ variables: { name:  name.toLowerCase()}})
        }
  }

  return <div id="search" className="flex-column">
        <SearchInputField value={artistName} onClick={updateArtistName}></SearchInputField>
        <div id="artist-col">
            {artistName && loading && <p>Loading...</p> }
            {artistName && error && <p>Error!</p> }
            {data?.searchExternalArtist && 
                    <SearchResults searchArtist={data?.searchExternalArtist} setSearchAlbum={onAlbumSelect}></SearchResults>
            }
        </div> 
  </div>

}