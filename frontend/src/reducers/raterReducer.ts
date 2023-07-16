import { zoomIdentity } from "d3-zoom"
import { RaterState } from "../models/ui/RaterTypes"
import { Scaler } from "../functions/scale"
import { MusicScope } from "../models/domain/MusicState"



export const raterReducer:React.Reducer<RaterState, RaterAction> = (state:any, action:RaterAction) => {
    switch(action.type) {
         case 'ARTIST_SONG_THROUGH_METADATA_FILTER': {
            const update = action.data 
            return { ...state, mode: MusicScope.SONG, selections: update.selections, scoreFilter: update.scoreFilter    } 
         }
         case 'BREADCRUMB_ARTIST': {
            return {...state, mode: MusicScope.ARTIST, isReadonly: true}
         }
         case 'ARTIST_SELECT' : {
            const update = action.data
            return {...state, mode: MusicScope.ALBUM, isReadonly: true, selections: update.selections  }
         }
         case 'ALBUM_SELECT' : {
            const update = action.data
            return {...state, mode: MusicScope.SONG, selections: update.selections  }
         }
         case 'ARTISTS_DATA_CHANGE': {
            const mode = state.mode
            if (mode === MusicScope.ARTIST) {
                const update = action.data || []
                return {...state, isReadonly:true, selections: update.selections }
            }
            return state
         }
         case 'ZOOM': {
            const update = action.data  
            const newScale = update.eventTransform.rescaleY(state.scaler.yScale) 
            return {...state, scaler: new Scaler(newScale) }
         }
         case 'ZOOM_RESET': {
             const resetScale = zoomIdentity.rescaleY(state.scaler.yScale) 
             return {...state, scaler: new Scaler(resetScale) }
         }
    }
}  

export type RaterAction = {
    type: RaterActionType  
    data?: any
} 
export type RaterActionType = 'ARTIST_SONG_THROUGH_METADATA_FILTER' 
| 'ALBUM_SELECT'  
| 'ARTIST_SELECT'  
| 'BREADCRUMB_ARTIST' 
| 'ARTISTS_DATA_CHANGE'
| 'ZOOM_RESET'
| 'ZOOM'