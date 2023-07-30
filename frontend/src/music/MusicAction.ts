import { Album, Artist, Song } from "../generated/graphql"
import { FilterMode } from "./MusicFilters"
import { MusicZoomLevel } from "./MusicState"

export type DataChangeMusicAction = {
    type: 'DATA_CHANGE',
    data: {
            artists?: Artist[],
            albums?: Album[],
            songs?: Song[]
    } 
} 

export type FilterChangeMusicAction = {
    type: 'FILTER_CHANGE',
    filters?: {
            artistIds?: string[]
            albumIds?: string[]
            songIds?: string[]
            scoreFilter?: { start: number, end: number }
    },  
    mode?:FilterMode, 
    zoomLevel?: MusicZoomLevel  
}  

export type MusicAction = FilterChangeMusicAction | DataChangeMusicAction  