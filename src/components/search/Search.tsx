import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Album, AlbumSearchResult, Artist, ArtistSearchResult, useSearchByArtistLazyQuery } from "../../generated/graphql";
import { SearchInputField } from "./SearchInputField";
import { SearchResults } from "./SearchResults";
import './Search.css'
import { Item } from "../../models/Item";

export type SearchState = {
  artist:ArtistSearchResult|undefined
  album:AlbumSearchResult|undefined
  artistName:string
  loading:boolean
}

interface Props {
    state:SearchState
    setState:Dispatch<SetStateAction<SearchState>>;
    setUnrated:Dispatch<SetStateAction<Item[]>>;
    refreshWith:{artist:Artist, album:Album}|undefined
}

export const Search = ({state,setState, refreshWith, setUnrated}:Props) => {
  const [searchArtist, searchArtistResults ]  = useSearchByArtistLazyQuery()    

  useEffect(() => {
      if (refreshWith) {
          reset()
          searchArtist({ variables: { vendorId: refreshWith.artist.vendorId, name: refreshWith.artist.name.toLowerCase()  }})
      }
  }, [refreshWith])

  useEffect(() => {
      if (searchArtistResults && refreshWith && searchArtistResults.data?.search?.artist) {
        const album = searchArtistResults.data.search.artist.albums?.find(it => it.id == refreshWith?.album.vendorId)
        setState({...state,
                artist: searchArtistResults.data.search.artist,
                album,
                loading: searchArtistResults.loading
        })
      } else {
          if (searchArtistResults && searchArtistResults.loading) {
              setState({...state, loading: true})
          }
      }
  }, [searchArtistResults])

  const reset  = () => {
    setState({
        artistName: ''
        ,artist: undefined
        ,album: undefined
        ,loading:false
    })
    setUnrated([])
  }

  useEffect(() => {
      if (!state.artistName.length) {
          reset()
      }
      if (state.artistName && state.artistName.length > 2) {
         searchArtist({ variables: { name:  state.artistName.toLowerCase()}})
         setState({...state, artist:undefined, album:undefined})
         setUnrated([])
      } 
  }, [state.artistName])
  useEffect(() => {
      if (!refreshWith && searchArtistResults && searchArtistResults.data?.search?.artist) {
        const artist = searchArtistResults.data.search.artist 
        const newState ={ ...state, artist, album:undefined, loading: searchArtistResults.loading }
        setState(newState)
        setUnrated([])
      } else if (searchArtistResults.loading) {
        setState({...state, loading: true })
      }
  }, [searchArtistResults])

  const setArtistName = (artistName:string) => setState({...state, artistName }) 
  const setAlbum = (album:AlbumSearchResult|undefined) => setState({...state, album }) 


  return <div id="search" className="grid">
        <SearchInputField value={state.artistName} onInputFieldChange={setArtistName}></SearchInputField>
        <div id="artist-col">
            {state.loading && <p>Loading...</p> }
            {searchArtistResults.error && <p>Error!</p> }
            {
            (state.artist) && 
                    <SearchResults searchArtist={state.artist} searchAlbum={state.album} setSearchAlbum={setAlbum}></SearchResults>
            }
        </div> 
  </div>

}