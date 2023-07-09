
import { Scaler } from '../../functions/scale'
import { ItemType } from '../domain/ItemTypes'

export type GlobalRaterState = {
    scaler:Scaler
    start:number
    end:number
    itemType:ItemType
}
export enum RaterOrientation {
    RIGHT, LEFT
}   

export const RATER_Y_BOTTOM:number = 750; 
export const RATER_X:number = 350; 
export const RATER_TIER_WIDTH:number = 50 