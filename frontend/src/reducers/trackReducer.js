
import { ACTIONS } from '../actions'

export default function(state ={} , action ) {
    switch(action.type) {
        case ACTIONS.TRACK_LOCATION: return Object.assign({}, state, action.d3Event)
        default: return state;
    }
}  