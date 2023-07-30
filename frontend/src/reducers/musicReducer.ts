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

    const reconcileFilters =  (oldFilters:string[], newFilters:string[]|undefined, mode?:FilterMode) => {
        if (!newFilters) {
            return oldFilters
        }
        const filters = oldFilters.filter(it => !newFilters.includes(it))  
        return (mode === FilterMode.ADDITIVE) ? [...filters, ...newFilters] : newFilters 
    }

    switch (action.type) {
        case 'DATA_CHANGE': {
            const newData = action.data
            const filters = state.filters 
            if (newData) {
                const artists = reconcileData<Artist>(state.data.artists, newData.artists) 
                const albums = reconcileData<Album>(state.data.albums, newData.albums)
                const songs = reconcileData<Song>(state.data.songs, newData.songs)
                const newState= { ...state, data: { artists, albums, songs }, filters }
                return newState
            }
            return state
        }
        case 'FILTER_CHANGE': {
            const newFilters = action.filters
            const mode = action.mode
            let filters = state.filters; 
            if (newFilters) {
                const artistIds = reconcileFilters(state.filters.artistIds, newFilters.artistIds, mode)
                const albumIds = reconcileFilters(state.filters.albumIds, newFilters.albumIds, mode) 
                const songIds = reconcileFilters(state.filters.songIds, newFilters.songIds, mode)
                const scoreFilter = (newFilters.scoreFilter) ? newFilters.scoreFilter : state.filters.scoreFilter
                filters = { artistIds, albumIds, songIds, scoreFilter }  
            }
            const zoomLevel = (action.zoomLevel !== undefined) ? action.zoomLevel : state.zoomLevel  
            const newState = { ...state, filters, zoomLevel }
            return newState
        }
    }
}