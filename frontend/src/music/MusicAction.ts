import { Album, Artist, Song } from "../generated/graphql"
import { FilterMode, PlaylistFilters } from "./MusicFilterModels"

export type DataChangeMusicAction = {
    type: 'DATA_CHANGE',
    data: {
            artists?: Artist[],
            albums?: Album[],
            songs?: Song[]
    } 
} 

export type NavigationFilterArtistChange = {
    type: 'NAVIGATION_FILTER_ARTIST_CHANGE'
    artistId: string
    mode: FilterMode
}  
export type PlaylistFilterChange = {
    type: 'PLAYLIST_FILTER_CHANGE'
    filters: PlaylistFilters
}  
export type NavigationFilterAlbumChange = {
    type: 'NAVIGATION_FILTER_ALBUM_CHANGE'
    artistId: string 
    albumId: string
    mode: FilterMode
}  

export type RaterFilterArtistChange = {
    type: 'RATER_FILTER_ARTIST_CHANGE'
    artistId: string 
    albumIds: string[]
    mode: FilterMode
}
export type RaterFilterAlbumChange = {
    type: 'RATER_FILTER_ALBUM_CHANGE'
    artistId: string
    albumId: string 
    mode: FilterMode
}

export type MusicAction = NavigationFilterAlbumChange | NavigationFilterArtistChange | RaterFilterAlbumChange | RaterFilterArtistChange | DataChangeMusicAction | PlaylistFilterChange