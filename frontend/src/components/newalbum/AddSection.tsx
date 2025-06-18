import { useEffect, useState } from "react"
import { ExternalAlbumSearchResult, ExternalArtistSearchResult, GetArtistsPageDocument, useCreateAlbumForExternalArtistMutation } from "../../generated/graphql"
import { AddPanel } from "./AddPanel"


interface Props {
  
}



export const AddSection = ({}:Props) => {

  const [searchAlbums, setSearchAlbums] = useState<ExternalAlbumSearchResult[]|undefined>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult|undefined>()
  const [$createAlbumsForExternalArtist, $albumsForExternalArtist ] = useCreateAlbumForExternalArtistMutation() 

  const onFinishAlbumSelections =  (artist:ExternalArtistSearchResult, albums:ExternalAlbumSearchResult[]) => {
    setSearchArtist(artist)
    setSearchAlbums(albums)
  }

  useEffect(() => {
    if (searchArtist && searchAlbums) {
       $createAlbumsForExternalArtist({ variables: { externalArtist: { id: searchArtist.id, name: searchArtist.name, thumbnail: searchArtist.thumbnail, albums: searchAlbums }, }, refetchQueries: [{ query: GetArtistsPageDocument, variables: { params: { pageNumber: 0} } } ]   })
    }
  }, [searchAlbums, searchArtist, $createAlbumsForExternalArtist])



    return <AddPanel onFinishAlbumSelections={onFinishAlbumSelections}  />
}