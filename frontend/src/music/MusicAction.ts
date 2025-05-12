import { Album, Artist, Song } from "../generated/graphql"
import { FilterMode } from "./MusicFilters"

export type DataChangeMusicAction = {
    type: 'DATA_CHANGE',
    data: {
            artists?: Artist[],
            albums?: Album[],
            songs?: Song[]
    } 
} 

export type RaterFilterChangeMusicAction = {
    type: 'RATER_FILTER_CHANGE',
    filters?: {
            artistIds?: string[]
            albumIds?: string[]
            songIds?: string[]
            scoreFilter?: { start: number, end: number }
    },  
    mode:FilterMode, 
}  

export type MusicAction = RaterFilterChangeMusicAction | DataChangeMusicAction  