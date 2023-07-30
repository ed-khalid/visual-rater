import { Scaler } from '../../functions/scale'
import { RaterUIItem } from '../domain/ItemTypes'

export type RaterState = {
    scaler:Scaler
    start:number
    end:number
    isReadonly:boolean
}
export enum RaterOrientation {
    RIGHT, LEFT
}
export interface RatedSongItemGrouped {
        id:string
        position:number
        items:RaterUIItem[]
}    

export const RATER_Y_TOP:number = 80; 
export const RATER_Y_BOTTOM:number = 740; 
export const RATER_X:number = 1500; 
export const RATER_TIER_WIDTH:number = 50 
export const SVG_IMAGE_SIZE:number = 40;  
export const CLOSENESS_THRESHOLD:number = 100; 

export const SVG_WIDTH:number = 3000 
export const SVG_HEIGHT:number = 750 