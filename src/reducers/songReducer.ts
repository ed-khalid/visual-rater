import { ACTIONS } from '../actions'
import { initialSongs }  from '../constants/initialState'

export function singleSongReducer(state = {} ,  action:any ) {
    switch(action.type) {
        case ACTIONS.CURRENTLY_DRAGGED_SONG: 
        case ACTIONS.MOVE_SONG_TO_RATER : return action.songInfo ? Object.assign({}, action.songInfo ) : null; 
        default: return state; 
    }
}

export function raterSongsReducer(state =[] , action:any ) {
    switch(action.type) {
        case ACTIONS.MOVE_SONG_TO_RATER: return [...state, action.songInfo]
        default: return state;
    }
}  

export function songsReducer(state = initialSongs, action:any) {

    switch(action.type) {

        case ACTIONS.UPDATE_RATER_SCORE: { 
            let newSong = action.songInfo 
            return state.map(it => { 
                if (it.title === newSong.title ) return newSong; 
                return it; 
            })  
        }   

        default: return state;
    }
}  

export function trackBlockSongsReducer(state = initialSongs, action:any) {

    switch(action.type) {
        case ACTIONS.MOVE_SONG_TO_RATER: { 
            let song = action.songInfo 
            return  state.filter(it => it.title !== song.title)
        }   
        default: return state;
    }

}