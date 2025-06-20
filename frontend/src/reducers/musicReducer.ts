import { MusicAction } from "../music/MusicAction";
import { MusicState } from "../music/MusicState";


export const musicReducer: React.Reducer<MusicState, MusicAction> =  (state: MusicState, action: MusicAction) : MusicState => {

    switch (action.type) {
        case 'PLAYLIST_FILTER_CHANGE': {
            const params = action.filters
            let playlistFilters = state.playlistFilters 
            let songFilters = state.songFilters 
            if (params.pageNumber !== undefined && params.pageNumber !== null) {
                playlistFilters = {...playlistFilters, pageNumber: params.pageNumber } 
            }
            if (params.artistIds !== undefined) {
                songFilters = { ...songFilters, artistIds: params.artistIds}
            }
            if (params.albumIds !== undefined) {
                songFilters = { ...songFilters, albumIds: params.albumIds}
            }
            const newState:MusicState = { ...state, playlistFilters , songFilters   }
            return newState
        }
    }
}