import { SongQueryParams } from "../generated/graphql"


export type PlaylistFilterChange = {
    type: 'PLAYLIST_FILTER_CHANGE'
    filters: SongQueryParams
}  
export type GridFilterChange = {
    type: 'GRID_FILTER_CHANGE'
    filters: SongQueryParams
}  
export type MusicAction = PlaylistFilterChange