import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Album, AlbumSearchResult, Artist, ArtistSearchResult, useGetSearchArtistByIdLazyQuery, useSearchByArtistLazyQuery } from "../../generated/graphql";
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
  const [searchByArtistName, searchByArtistNameResults ]  = useSearchByArtistLazyQuery()    
  const [searchByArtistId, searchByArtistIdResults] = useGetSearchArtistByIdLazyQuery()

  useEffect(() => {
      if (refreshWith) {
          reset()
          searchByArtistId({ variables: { vendorId: refreshWith.artist.vendorId }})
      }
  }, [refreshWith])

  useEffect(() => {
      if (searchByArtistIdResults && refreshWith && searchByArtistIdResults.data?.search?.artist) {
        const album = searchByArtistIdResults.data.search.artist.albums?.find(it => it.id == refreshWith?.album.vendorId)
        setState({...state,
                artist: searchByArtistIdResults.data.search.artist,
                album,
                loading: searchByArtistIdResults.loading
        })
      } else {
          if (searchByArtistIdResults && searchByArtistIdResults.loading) {
              setState({...state, loading: true})
          }
      }
  }, [searchByArtistIdResults])

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
         searchByArtistName({ variables: { name:  state.artistName}})
         setState({...state, artist:undefined, album:undefined})
         setUnrated([])
      } 
  }, [state.artistName])
  useEffect(() => {
      if (searchByArtistNameResults && searchByArtistNameResults.data?.search?.artist) {
        const artist = searchByArtistNameResults.data.search.artist 
        const newState ={ ...state, artist, album:undefined, loading: searchByArtistNameResults.loading }
        setState(newState)
        setUnrated([])
      } else if (searchByArtistNameResults.loading) {
        setState({...state, loading: true })
      }
  }, [searchByArtistNameResults])

  const setArtistName = (artistName:string) => setState({...state, artistName }) 
  const setAlbum = (album:AlbumSearchResult|undefined) => setState({...state, album }) 


  return <div id="search" className="grid">
        <SearchInputField value={state.artistName} onInputFieldChange={setArtistName}></SearchInputField>
        <div id="artist-col">
            {state.loading && <p>Loading...</p> }
            {searchByArtistNameResults.error && <p>Error!</p> }
            {
            (state.artist) && 
                    <SearchResults searchArtist={state.artist} searchAlbum={state.album} setSearchAlbum={setAlbum}></SearchResults>
            }
        </div> 
  </div>

}