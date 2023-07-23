import { Scaler } from '../../functions/scale'
import { RatedMusicItemUI } from './ItemTypes'

export type RaterState = {
    scaler:Scaler
    start:number
    end:number
    isReadonly:boolean
}
export enum RaterOrientation {
    RIGHT, LEFT
}
export type RatedSongItemGrouped  = {
        id:string
        position:number
        ,shouldDestroy?:boolean
        ,items:RatedMusicItemUI[]
}    

export const RATER_Y_TOP:number = 60; 
export const RATER_Y_BOTTOM:number = 720; 
export const RATER_X:number = 1500; 
export const RATER_TIER_WIDTH:number = 60 
export const SVG_IMAGE_SIZE:number = 40;  
export const CLOSENESS_THRESHOLD:number = 150; 

export const SVG_WIDTH:number = 3000 
export const SVG_HEIGHT:number = 750 