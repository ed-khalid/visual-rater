
import { Scaler } from '../../functions/scale'
import { ItemType } from '../domain/ItemTypes'

export type GlobalRaterState = {
    scaler:Scaler
    start:string
    end:string
    itemType:ItemType
}
export enum RaterOrientation {
    RIGHT, LEFT
}   

export const RATER_Y_BOTTOM:number = 600; 
export const RATER_X:number = 350; 
export const RATER_TIER_WIDTH:number = 90 