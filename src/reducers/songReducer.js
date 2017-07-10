import { ACTIONS } from '../actions'
import  Song from '../models/song'

export const initialSongs =  
  ['Battery'
  ,'Master of Puppets'
  ,'The Thing That Should Not Be'
  ,'Welcome Home (Sanitarium)'
  ,'Disposable Heroes'
  ,'Leper Messiah'
  ,'Orion'
  ,'Damage, Inc.'
  ].map(it => new Song(it))



export function singleSongReducer(state = {} ,  action ) {
    switch(action.type) {
        case ACTIONS.CURRENTLY_DRAGGED_SONG: 
        case ACTIONS.MOVE_SONG_TO_RATER : return action.songInfo ? Object.assign({}, action.songInfo ) : null; 
        default: return state; 
    }
}

export function raterSongsReducer(state =[] , action ) {
    switch(action.type) {
        case ACTIONS.MOVE_SONG_TO_RATER: return [...state, action.songInfo]
        default: return state;
    }
}  

export function trackListSongsReducer(state = initialSongs, action) {
    switch(action.type) {
        case ACTIONS.UPDATE_RATER_SCORE: { 
            let newSong = action.songInfo; 
            return state.map(it => { 
                if (it.title === newSong.title ) return newSong; 
                return it; 
            })  
        }   
        default: return state;
    }
}  

export function trackBlockSongsReducer(state = initialSongs, action) {

    switch(action.type) {
        case ACTIONS.MOVE_SONG_TO_RATER: { 
            let song = action.songInfo 
            return  state.filter(it => it.title !== song.title)
        }   
        default: return state;
    }

}