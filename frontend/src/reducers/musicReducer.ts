import { MusicAction } from "../music/MusicAction";
import { MusicState } from "../music/MusicState";


export const musicReducer: React.Reducer<MusicState, MusicAction> =  (state: MusicState, action: MusicAction) : MusicState => {

    switch (action.type) {
        case 'PLAYLIST_FILTER_CHANGE': {
            const filters = action.filters
            const newState:MusicState = { ...state, playlistFilters: filters }
            return newState
        }
    }
}