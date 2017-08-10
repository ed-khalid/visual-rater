import {currentArtist, currentAlbum } from '../constants/initialState'    
export const ACTIONS = { 
     TRACK_LOCATION: 'TRACK_LOCATION'
     , CURRENTLY_DRAGGED_SONG: 'CURRENT_SONG'
     , MOVE_SONG_TO_RATER: 'ADD_SONG'
     , UPDATE_RATER_SCORE: 'UPDATE_SCORE'
    }  

export function TrackLocationActionCreator(event)  {
    return {
        type: ACTIONS.TRACK_LOCATION
        ,d3Event: event
    }
}  

export function TrackBlockSongActionCreator(song) {

    return {
        type:ACTIONS.CURRENTLY_DRAGGED_SONG
        ,songInfo: song
    }

}



export function RaterSongActionCreator(song,isOnRater) {
    if (!isOnRater) return {
        type: ACTIONS.MOVE_SONG_TO_RATER
        ,songInfo : { title:song.title, y:song.score }   
    }
    else {
        song.artist = currentArtist 
        song.album = currentAlbum 
        return {type: ACTIONS.UPDATE_RATER_SCORE
        ,songInfo : song 
        }
    }
}


