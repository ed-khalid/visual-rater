import { Scaler } from '../functions/scale'
import { Album, Artist, Maybe, Song } from '../generated/graphql'

export type CartesianRaterState = {
    scaler:Scaler
    start:number
    end:number
    isReadonly:boolean
}
// export interface RaterUIItemGrouped {
//         id:string
//         position:number
//         items:RaterUIItem[]
// }    

export const CARTESIAN_RATER_Y_TOP:number = 10; 
export const CARTESIAN_RATER_Y_BOTTOM:number = 740; 
export const CARTESIAN_RATER_X:number = 10; 
export const CARTESIAN_RATER_TIER_WIDTH:number = 50 
export const CARTESIAN_SVG_IMAGE_SIZE:number = 40;  
export const CARTESIAN_CLOSENESS_THRESHOLD:number = 100; 

export const CARTESIAN_SVG_WIDTH:number = 7000 
export const CARTESIAN_SVG_HEIGHT:number = 770 


export type RaterEntityRequest = {
    artist: Artist
    albumId?: string
}   

export type FatSong = {
    artist: {name: string, id:string} 
    album: { thumbnail?: Maybe<string>, dominantColor?:Maybe<string>, name:string}
    song: Song
} 