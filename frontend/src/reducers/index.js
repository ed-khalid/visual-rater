import { combineReducers } from 'redux'
import  TrackLocationReducer  from './trackReducer'
import  { raterSongsReducer, trackListSongsReducer, singleSongReducer, trackBlockSongsReducer  }    from './songReducer'

const rootReducer = combineReducers({

    trackLocation:  TrackLocationReducer

    ,trackBlocks: trackBlockSongsReducer  
    ,trackList : trackListSongsReducer 
    ,raterSongs: raterSongsReducer 
    ,currentlyDraggedSong: singleSongReducer
})
export default rootReducer;