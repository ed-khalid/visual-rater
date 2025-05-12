import { Album, Artist, Song } from "../generated/graphql";
import { MusicAction } from "../music/MusicAction";
import { FilterMode } from "../music/MusicFilters";
import { MusicEntity, MusicState } from "../music/MusicState";


export const musicReducer: React.Reducer<MusicState, MusicAction> =  (state: MusicState, action: MusicAction) : MusicState => {

    const reconcileData = <T extends MusicEntity> (oldData:Array<T>, newData:Array<T>|undefined) => {
        if (!newData) {
            return oldData
        }
        const newDataIds = newData.map(it => it.id) 
        const data = oldData.filter(it => !newDataIds.includes(it.id)  )
        return [...data, ...newData]
    }

    const reconcileFilters =  (oldFilters:string[]|undefined, newFilters:string[]|undefined, mode:FilterMode): string[]|undefined => {
        if (!newFilters) {
            return undefined
        }
        if (!oldFilters) {
            return newFilters
        }
        // reset
        if (newFilters.length === 0) {
            return [] 
        }
        const filters = oldFilters.filter(it => !newFilters.includes(it))  
        if (mode === FilterMode.ADDITIVE) {
            return [...filters, ...newFilters]
        } else if (mode === FilterMode.EXCLUSIVE) {
            return newFilters
            // reductive
        } else {
            return filters 
        }
    }

    switch (action.type) {
        case 'DATA_CHANGE': {
            const newData = action.data
            if (newData) {
                const artists = reconcileData<Artist>(state.data.artists, newData.artists) 
                const albums = reconcileData<Album>(state.data.albums, newData.albums)
                const songs = reconcileData<Song>(state.data.songs, newData.songs)
                const newState= { ...state, data: { artists, albums, songs }}
                return newState
            }
            return state
        }
        case 'RATER_FILTER_CHANGE': {
            const newFilters = action.filters
            const mode = action.mode
            let raterFilters = state.raterFilters; 
            if (newFilters) {
                const artistIds = reconcileFilters(state.raterFilters.artistIds, newFilters.artistIds, mode)
                const albumIds = reconcileFilters(state.raterFilters.albumIds, newFilters.albumIds, mode) 
                const songIds = reconcileFilters(state.raterFilters.songIds, newFilters.songIds, mode) 
                const scoreFilter = newFilters.scoreFilter || state.raterFilters.scoreFilter 
                raterFilters = { artistIds, albumIds, songIds, scoreFilter }  
            }
            const newState = { ...state, raterFilters }
            console.log('newState filter', newState)
            return newState
        }
    }
}