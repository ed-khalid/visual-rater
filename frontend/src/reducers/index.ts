import { combineReducers } from 'redux'
import TrackLocationReducer  from './trackReducer'
import { raterSongsReducer, songsReducer, singleSongReducer, trackBlockSongsReducer  }    from './songReducer'

const rootReducer = combineReducers({

    trackLocation:  TrackLocationReducer
    ,trackBlocks: trackBlockSongsReducer  
    ,songs : songsReducer 
    ,raterSongs: raterSongsReducer 
    ,currentlyDraggedSong: singleSongReducer
})
export default rootReducer;