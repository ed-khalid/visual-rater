import { useEffect, useState } from "react"
import { ExternalAlbumSearchResult, ExternalArtistSearchResult, NewSongInput, useCreateAlbumMutation, useGetTracksForSearchAlbumLazyQuery } from "../../generated/graphql"
import { AddPanel } from "./AddPanel"
import { ExternalFullSearchResult } from "../../models/ExternalFullSearchResult"
import { SpotifySearchPanel } from "./SpotifySearchPanel"


interface Props {
    onCreateAlbum: any
}



export const AddSection = ({onCreateAlbum}:Props) => {

  const [searchAlbum, setSearchAlbum] = useState<ExternalAlbumSearchResult>()
  const [searchArtist,setSearchArtist] = useState<ExternalArtistSearchResult>()
  const [$getSearchAlbumTracks, $searchAlbumTracks ] = useGetTracksForSearchAlbumLazyQuery()
  const [createAlbum, ] = useCreateAlbumMutation() 
  const [spotifySearchTerm, setSpotifySearchTerm] = useState<string|undefined>()
  const [reset, setReset] = useState<boolean>(false)

  const onExternalAlbumSearchClick =  (artist:ExternalArtistSearchResult, album:ExternalAlbumSearchResult) => {
    setSearchArtist(artist)
    setSearchAlbum(album)
    setSpotifySearchTerm(undefined)
  }

  useEffect(() => {
    if ($searchAlbumTracks.data?.searchExternalAlbumTracks && searchArtist && searchAlbum) {
      const searchArtistAlbumTracks:ExternalFullSearchResult =  {
        artist: searchArtist,
        album: searchAlbum,
        tracks: $searchAlbumTracks.data?.searchExternalAlbumTracks 
      }
      const songs:NewSongInput[] = searchArtistAlbumTracks.tracks.map((it,index) => 
        ({ 
          name: it.name,
          discNumber: it.discNumber,
          number: it.trackNumber,
          score: 50 + index
        }))
        createAlbum({ variables: { albumInput: {
          name: searchArtistAlbumTracks.album.name,
          year: searchArtistAlbumTracks.album.year,
          vendorId: searchArtistAlbumTracks.album.id,
          thumbnail: searchArtistAlbumTracks.album.thumbnail,
          artist: {
            name: searchArtistAlbumTracks.artist.name,
            thumbnail: searchArtistAlbumTracks.artist.thumbnail,
            vendorId: searchArtistAlbumTracks.artist.id 
          }, 
          songs
        }},  update: () => {
            setSearchArtist(undefined)
            setSearchAlbum(undefined)
            onCreateAlbum(searchArtistAlbumTracks.artist.name)
        } 
      }, )
    }
  }, [$searchAlbumTracks.data?.searchExternalAlbumTracks, searchArtist, searchAlbum, createAlbum] )

  useEffect(() => {
    if (searchAlbum) {
      $getSearchAlbumTracks({ variables: { albumId: searchAlbum.id} })
    }
  }, [searchAlbum, $getSearchAlbumTracks])

  const onSpotifySearch = (term:string) => {
    setSpotifySearchTerm(term)
  } 

  const onCancel = () => {
    setSpotifySearchTerm(undefined)
    setReset(true)
  }

    return <div className="sidebar-section" id="add-section">
    <AddPanel onSpotifySearch={onSpotifySearch} reset={reset} />
    {spotifySearchTerm && <SpotifySearchPanel term={spotifySearchTerm} onExternalAlbumSelect={onExternalAlbumSearchClick} onCancel={onCancel} />}
    </div>

}