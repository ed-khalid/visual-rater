import { combineReducers } from 'redux'
import  TrackLocationReducer  from './trackReducer'
import  { raterSongReducer, currentSongReducer, tracklistSongReducer,  addSongReducer }    from './songReducer'

const rootReducer = combineReducers({
    trackLocation:  TrackLocationReducer
    ,tracklist: tracklistSongReducer  
    ,raterSongs: raterSongReducer 
    ,currentSong: currentSongReducer
})
export default rootReducer;