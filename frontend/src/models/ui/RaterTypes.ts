
import { RaterWrapperMode } from '../../components/rater/RaterWrapper'
import { Scaler } from '../../functions/scale'
import { ItemType } from '../domain/ItemTypes'
import { RatedMusicItemUI } from './ItemTypes'

export type GlobalRaterState = {
    scaler:Scaler
    start:number
    end:number
    mode:RaterWrapperMode,
    scoreFilter:{start:number, end:number}
    selections:Array<string>
    isReadonly:boolean
    itemType:ItemType
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

export const RATER_Y_TOP:number = 65; 
export const RATER_Y_BOTTOM:number = 665; 
export const RATER_X:number = 400; 
export const RATER_TIER_WIDTH:number = 50 
export const SVG_WIDTH:number = 800 
export const SVG_HEIGHT:number = 700 