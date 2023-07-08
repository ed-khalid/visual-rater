import { ExternalAlbumSearchResult, ExternalArtistSearchResult, ExternalTrackSearchResult } from "../../generated/graphql"


export type ExternalFullSearchResult = {
    artist:ExternalArtistSearchResult 
    album:ExternalAlbumSearchResult
    tracks:ExternalTrackSearchResult[]
}