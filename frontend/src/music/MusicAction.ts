import { PlaylistFilters } from "./MusicFilterModels"


export type PlaylistFilterChange = {
    type: 'PLAYLIST_FILTER_CHANGE'
    filters: PlaylistFilters
}  
export type MusicAction = PlaylistFilterChange