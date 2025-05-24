import { Dispatch, useEffect, useState } from "react"
import { Artist, ExternalAlbumSearchResult, ExternalArtistSearchResult, useCreateAlbumForExternalArtistMutation } from "../../generated/graphql"
import { AddPanel } from "./AddPanel"
import { SpotifySearchPanel } from "./SpotifySearchPanel"
import { MusicAction } from "../../music/MusicAction"
import { FilterMode } from "../../music/MusicFilters"


interface Props {
  musicDispatch: Dispatch<MusicAction>
}



export const AddSection = ({musicDispatch}:Props) => {

  const [searchAlbums, setSearchAlbums] = useState<ExternalAlbumSearchResult[]|undefined>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult|undefined>()
  const [$createAlbumsForExternalArtist, $albumsForExternalArtist ] = useCreateAlbumForExternalArtistMutation() 
  const [spotifySearchTerm, setSpotifySearchTerm] = useState<string|undefined>()
  const [reset, setReset] = useState<boolean>(false)

  const onFinishAlbumSelections =  (artist:ExternalArtistSearchResult, albums:ExternalAlbumSearchResult[]) => {
    setSearchArtist(artist)
    setSearchAlbums(albums)
    setSpotifySearchTerm(undefined)
  }

  useEffect(() => {
    if ($albumsForExternalArtist.data && !$albumsForExternalArtist.loading) {
      const artistWithoutAlbums:Artist = {
        id: $albumsForExternalArtist.data.createAlbumsForExternalArtist.id,
        name: $albumsForExternalArtist.data.createAlbumsForExternalArtist.name,
        thumbnail: $albumsForExternalArtist.data.createAlbumsForExternalArtist.thumbnail,
        dominantColor: $albumsForExternalArtist.data.createAlbumsForExternalArtist.dominantColor,
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

  const onSpotifySearch = (term:string) => {
    setSpotifySearchTerm(term)
  } 

  const onCancel = () => {
    setSpotifySearchTerm(undefined)
    setReset(true)
  }

    return <div className="sidebar-section" id="add-section">
    <AddPanel onSpotifySearch={onSpotifySearch} reset={reset} />
    {spotifySearchTerm && <SpotifySearchPanel term={spotifySearchTerm} onFinishAlbumSelections={onFinishAlbumSelections} onCancel={onCancel} />}
    </div>

}