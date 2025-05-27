import { zoomIdentity } from "d3-zoom"
import { CartesianRaterState } from "../../src/models/RaterModels"
import { Scaler } from "../functions/scale"
import { interpolateRound } from "d3"



export const raterReducer:React.Reducer<CartesianRaterState, RaterAction> = (state:CartesianRaterState, action:RaterAction) => {
    switch(action.type) {
         case 'ZOOM': {
            const update = action.data  
            const newScale = update.eventTransform.rescaleY(state.scaler.yScale).interpolate(interpolateRound) 
            return {...state, scaler: new Scaler({scale:newScale}) }
         }
         case 'ZOOM_RESET': {
             const resetScale = zoomIdentity.rescaleY(state.scaler.yScale) 
             return {...state, scaler: new Scaler({scale:resetScale}) }
         }
    }
}  

export type RaterAction = {
    type: RaterActionType  
    data?: any
} 
export type RaterActionType =  'ZOOM_RESET' | 'ZOOM'