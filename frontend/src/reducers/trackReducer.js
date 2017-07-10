
import { ACTIONS } from '../actions'

export default function(state ={} , action ) {
    switch(action.type) {
        case ACTIONS.TRACK_LOCATION: return Object.assign({}, state, action.d3Event)
        case ACTIONS.MOVE_SONG_TO_RATER: return null;  
        default: return state;
    }
}  