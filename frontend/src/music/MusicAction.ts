import { Album, Artist, Song } from "../generated/graphql"
import { MusicFilter } from "../models/ArtistNavigationFilter"
import { FilterMode } from "./MusicFilters"

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
export type NavigationFilterAlbumChange = {
    type: 'NAVIGATION_FILTER_ALBUM_CHANGE'
    artistId: string 
    albumId: string
    mode: FilterMode
}  

export type RaterFilterChangeMusicAction = {
    type: 'RATER_FILTER_CHANGE',
    filters: {
            artistIds?: string[]
            albumIds?: string[]
            songIds?: string[]
            scoreFilter?: { start: number, end: number }
    },  
    mode:FilterMode, 
}  

export type MusicAction = NavigationFilterAlbumChange | NavigationFilterArtistChange | RaterFilterChangeMusicAction | DataChangeMusicAction  