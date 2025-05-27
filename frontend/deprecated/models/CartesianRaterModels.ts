import { Scaler } from "../functions/scale";
import { MusicUIItem, SongUIItem } from "../../src/models/CoreModels";

export const ANIMATION_DURATION = 300;
export type Position =  {
    x:number;
    y:number;
}
export const CARTESIAN_RATER_Y_TOP:number = 10; 
export const CARTESIAN_RATER_Y_BOTTOM:number = 740; 
export const CARTESIAN_RATER_X:number = 10; 
export const CARTESIAN_RATER_TIER_WIDTH:number = 50 
export const CARTESIAN_SVG_IMAGE_SIZE:number = 40;  
export const CARTESIAN_CLOSENESS_THRESHOLD:number = 100; 

export const CARTESIAN_SVG_WIDTH:number = 7000 
export const CARTESIAN_SVG_HEIGHT:number = 770 

export type CartesianRaterState = {
    scaler:Scaler
    start:number
    end:number
    isReadonly:boolean
}
export type RaterTier = number
export type CartesianRaterSongUIItem = CartesianRaterItem & SongUIItem     
export interface CartesianRaterItem extends MusicUIItem {
    tier?:RaterTier
    nodeRef:any 
    shouldDrawLine:boolean
}
export type SongItemPosition = {
    y: {
        line: {
            y1:number
            y2:number
        }
        rect:number
        image:number
        name:number
        score:number
        overlay:number
        border:number
    }
} 