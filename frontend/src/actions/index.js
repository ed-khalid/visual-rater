export const ACTIONS = { TRACK_LOCATION: 'TRACK_LOCATION', CURRENT_SONG: 'CURRENT_SONG', MOVE_SONG_TO_RATER: 'ADD_SONG'}  

export function TrackLocationActionCreator(event, dragEnd )  {
    return {
        type: ACTIONS.TRACK_LOCATION
        ,d3Event: event
    }
}  

export function CurrentSongActionCreator(song) {

    return {
        type:ACTIONS.CURRENT_SONG
        ,songInfo: song
    }

}

export function SongActionCreator(song, location) {
    return {
        type: ACTIONS.MOVE_SONG_TO_RATER
        ,songInfo : { title:song.title, y:location }   
    }
}


