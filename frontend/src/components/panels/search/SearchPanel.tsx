import { useState } from "react"
import { useSearchByArtistLazyQuery } from "../../../generated/graphql"
import { Panel } from "../Panel"
import React from "react"
import { SearchInput } from "./SearchInput"
import { SearchResults } from "./SearchResults"
import './SearchPanel.css'

interface Props {
    onExternalAlbumSelect:any
}


export const SearchPanel =  ({onExternalAlbumSelect}:Props) => {
    const [searchArtist, {data ,error,loading} ] = useSearchByArtistLazyQuery() 
    const [artistName, setArtistName] = useState<string>('')

    const updateArtistName = (name:string) => {
            if (!name.length) {
                setArtistName('')
            } else {
            setArtistName(name)
            searchArtist({ variables: { name:  name.toLowerCase()}})
            }
    }

    return <div>
            <Panel id="search" isMoveable={false} isCollapsible={true}>
                <div id="search-content">
                    <SearchInput value={artistName} onClick={updateArtistName}></SearchInput>
                </div>
           </Panel>
           {artistName && <Panel id="search-results" isMoveable={false} isCloseable={true}>
             <div>
                        {loading && <p>Loading...</p> }
                        {error && <p>Error!</p> }
                        {data?.searchExternalArtist && 
                                <SearchResults searchArtist={data?.searchExternalArtist} setSearchAlbum={onExternalAlbumSelect}></SearchResults>
                        }
             </div>
           </Panel>}
        </div>
    

}
