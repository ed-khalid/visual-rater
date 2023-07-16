import { Album, Artist, Song } from "../generated/graphql";
import { MusicEntity, MusicState } from "../models/domain/MusicState";


export const musicReducer: React.Reducer<MusicState, MusicAction> = (state: MusicState, action: MusicAction) => {
    console.log('action' + JSON.stringify(action))

    const reconcileData = <T extends MusicEntity> (oldData:Array<T>, newData:Array<T>|undefined) => {
        if (!newData) {
            return oldData
        }
        const newDataIds = newData.map(it => it.id) 
        const data = oldData.filter(it => !newDataIds.includes(it.id)  )
        return [...data, ...newData]
    }

    switch (action.type) {
        case 'DATA_CHANGE': {
            const newData = action.variables?.data
            const newFilters = action.variables?.filters || state.filters
            if (newData) {

                const artistIds = newFilters?.artistIds || state.filters.artistIds
                const albumIds = newFilters?.albumIds || state.filters.albumIds
                const songIds = newFilters?.songIds || state.filters.songIds
                const scoreFilter = newFilters?.scoreFilter || state.filters.scoreFilter
                const filters = { artistIds, albumIds, songIds, scoreFilter }

                const artists = reconcileData<Artist>(state.data.artists, newData.artists) 
                const albums = reconcileData<Album>(state.data.albums, newData.albums)
                const songs = reconcileData<Song>(state.data.songs, newData.songs)
                return { ...state, data: { artists, albums, songs }, filters }
            }
            return state
        }
        case 'FILTER_CHANGE': {
            const filters = action.variables?.filters
            if (filters) {
                const artistIds = filters?.artistIds || state.filters.artistIds
                const albumIds = filters?.albumIds || state.filters.albumIds
                const songIds = filters?.songIds || state.filters.songIds
                const scoreFilter = filters?.scoreFilter || state.filters.scoreFilter
                return { ...state, filters: { artistIds, albumIds, songIds, scoreFilter } }
            }
            return state
        }
    }
}

export type MusicAction = {
    type: MusicActionType
    variables?: {
        data?: {
            artists?: Artist[],
            albums?: Album[],
            songs?: Song[]
        }
        filters?: {
            artistIds?: string[]
            albumIds?: string[]
            songIds?: string[]
            scoreFilter?: { start: number, end: number }
        }
    }
}
export type MusicActionType =
    'DATA_CHANGE'
    | 'FILTER_CHANGE'



