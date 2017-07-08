import { combineReducers } from 'redux'
import  TrackLocationReducer  from './trackReducer'

const rootReducer = combineReducers({
    trackLocation:  TrackLocationReducer
})
export default rootReducer;