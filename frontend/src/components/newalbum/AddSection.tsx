import { useEffect, useState } from "react"
import { Artist, ExternalAlbumSearchResult, ExternalArtistSearchResult, useCreateAlbumForExternalArtistMutation } from "../../generated/graphql"
import { AddPanel } from "./AddPanel"
import { FilterMode } from "../../music/MusicFilters"
import { useMusicDispatch } from "../../hooks/MusicStateHooks"


interface Props {
  
}



export const AddSection = ({}:Props) => {

  const musicDispatch = useMusicDispatch()

  const [searchAlbums, setSearchAlbums] = useState<ExternalAlbumSearchResult[]|undefined>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult|undefined>()
  const [$createAlbumsForExternalArtist, $albumsForExternalArtist ] = useCreateAlbumForExternalArtistMutation() 

  const onFinishAlbumSelections =  (artist:ExternalArtistSearchResult, albums:ExternalAlbumSearchResult[]) => {
    setSearchArtist(artist)
    setSearchAlbums(albums)
  }

  useEffect(() => {
    if ($albumsForExternalArtist.data && !$albumsForExternalArtist.loading) {
      const artistWithoutAlbums:Artist = {
        id: $albumsForExternalArtist.data.createAlbumsForExternalArtist.id,
        name: $albumsForExternalArtist.data.createAlbumsForExternalArtist.name,
        thumbnail: $albumsForExternalArtist.data.createAlbumsForExternalArtist.thumbnail,
        thumbnailDominantColors: $albumsForExternalArtist.data.createAlbumsForExternalArtist.thumbnailDominantColors,
        metadata: $albumsForExternalArtist.data.createAlbumsForExternalArtist.metadata,
        score: $albumsForExternalArtist.data.createAlbumsForExternalArtist.score,
        albums: []
      }  
      musicDispatch({ type: 'DATA_CHANGE', data: { artists: [artistWithoutAlbums], albums: $albumsForExternalArtist.data.createAlbumsForExternalArtist.albums   } })
      musicDispatch({ type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId: artistWithoutAlbums.id , mode: FilterMode.EXCLUSIVE })
    }

  }, [$albumsForExternalArtist])

  useEffect(() => {
    if (searchArtist && searchAlbums) {
       $createAlbumsForExternalArtist({ variables: { externalArtist: { id: searchArtist.id, name: searchArtist.name, thumbnail: searchArtist.thumbnail, albums: searchAlbums }, }})
    }
  }, [searchAlbums, searchArtist, $createAlbumsForExternalArtist])



    return <AddPanel onFinishAlbumSelections={onFinishAlbumSelections}  />
}