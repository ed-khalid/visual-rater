export const ACTIONS = { 
     TRACK_LOCATION: 'TRACK_LOCATION'
     , CURRENTLY_DRAGGED_SONG: 'CURRENT_SONG'
     , MOVE_SONG_TO_RATER: 'ADD_SONG'
     , UPDATE_SCORE: 'UPDATE_SCORE'
    }  

export function TrackLocationActionCreator(event, dragEnd )  {
    return {
        type: ACTIONS.TRACK_LOCATION
        ,d3Event: event
    }
}  

export function CurrentSongActionCreator(song) {

    return {
        type:ACTIONS.CURRENTLY_DRAGGED_SONG
        ,songInfo: song
    }

}

export function SongActionCreator(song, location, isOnRater) {
    if (!isOnRater) return {
        type: ACTIONS.MOVE_SONG_TO_RATER
        ,songInfo : { title:song.title, y:location }   
    }
    else return {
        type: ACTIONS.UPDATE_SCORE
        ,songInfo : { title:song.title, score:location }   
    }
}


