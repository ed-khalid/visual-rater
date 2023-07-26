import { Album, Artist, Song } from "../generated/graphql";
import { MusicEntity, MusicState } from "../music/MusicState";


export enum FilterMode { ADDITIVE, EXCLUSIVE }
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
                return { ...state, data: { artists, albums, songs }, filters }
            }
            return state
        }
        case 'FILTER_CHANGE': {
            const filters = action.filters
            const mode = action.mode
            if (filters) {
                const artistIds = reconcileFilters(state.filters.artistIds, filters.artistIds, mode)
                const albumIds = reconcileFilters(state.filters.albumIds, filters.albumIds, mode) 
                const songIds = reconcileFilters(state.filters.songIds, filters.songIds, mode)
                const scoreFilter = (filters.scoreFilter) ? filters.scoreFilter : state.filters.scoreFilter
                return { ...state, filters: { artistIds, albumIds, songIds, scoreFilter } } 
            }
            return state
        }
    }
}


export type DataChangeMusicAction = {
    type: 'DATA_CHANGE',
    data: {
            artists?: Artist[],
            albums?: Album[],
            songs?: Song[]
    } 
} 

export type FilterChangeMusicAction = {
    type: 'FILTER_CHANGE',
    filters: {
            artistIds?: string[]
            albumIds?: string[]
            songIds?: string[]
            scoreFilter?: { start: number, end: number }
    },  
    mode?:FilterMode 
}  
  
export type MusicAction = FilterChangeMusicAction | DataChangeMusicAction  
