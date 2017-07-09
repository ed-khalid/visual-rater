import { combineReducers } from 'redux'
import  TrackLocationReducer  from './trackReducer'
import  { raterSongReducer, trackListSongReducer, newSongReducer, trackBlockSongReducer  }    from './songReducer'

const rootReducer = combineReducers({
    trackLocation:  TrackLocationReducer
    ,trackBlocks: trackBlockSongReducer  
    ,raterSongs: raterSongReducer 
    ,newSong: newSongReducer
    ,trackList : trackListSongReducer 
})
export default rootReducer;