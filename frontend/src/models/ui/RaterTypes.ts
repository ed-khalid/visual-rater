
import { Scaler } from '../../functions/scale'
import { ItemType } from '../domain/ItemTypes'

export type GlobalRaterState = {
    scaler:Scaler
    start:number
    end:number
    isReadonly:boolean
    itemType:ItemType
}
export enum RaterOrientation {
    RIGHT, LEFT
}   

export const RATER_Y_TOP:number = 50; 
export const RATER_Y_BOTTOM:number = 650; 
export const RATER_X:number = 350; 
export const RATER_TIER_WIDTH:number = 50 