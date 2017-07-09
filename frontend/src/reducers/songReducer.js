import { ACTIONS } from '../actions'
import  Song from '../models/song'

let trackDisplayerSongs =  
  ['Battery'
  ,'Master of Puppets'
  ,'The Thing That Should Not Be'
  ,'Welcome Home (Sanitarium)'
  ,'Disposable Heroes'
  ,'Leper Messiah'
  ,'Orion'
  ,'Damage, Inc.'
  ].map(it => new Song(it))



export function currentSongReducer(state = {} ,  action ) {

    switch(action.type) {
        case ACTIONS.CURRENT_SONG : return Object.assign({}, state, action.songInfo ) 
        default: return state; 
    }

}

export function raterSongReducer(state =[] , action ) {
    switch(action.type) {
        case ACTIONS.MOVE_SONG_TO_RATER: return [...state, action.songInfo]
        default: return state;
    }
}  

export function tracklistSongReducer(state = trackDisplayerSongs, action) {

    switch(action.type) {
        case ACTIONS.MOVE_SONG_TO_RATER: { 
            let song = action.songInfo 
            return  state.filter(it => it.title != song.title)
        }   
        default: return state;
    }

}