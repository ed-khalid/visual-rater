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

    const reconcileFilters =  (oldFilters:string[], newFilters:string[]|undefined, mode:FilterMode): string[] => {
        if (!newFilters) {
            return oldFilters
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
                console.log('newState post DATA_CHANGE', newState)
                return newState
            }
            return state
        }
        case 'NAVIGATION_FILTER_ARTIST_CHANGE': {
            const artistId = action.artistId
            const mode = action.mode
            const existing = state.navigationFilters.find(it => it.artistId === artistId)  
            if (mode === FilterMode.EXCLUSIVE) {
                const albumIds  = existing?.albumIds || []  
                return {...state, navigationFilters: [{ artistId, albumIds }] } 
            } else if (mode === FilterMode.ADDITIVE) {
                if (existing) return state
                const newState = { ...state, navigationFilters: [...state.navigationFilters, { artistId, albumIds: [] }] } 
                console.log('newState post NAV_FILTER_ARTIST_CHANGE (Additive)', newState)
                return newState
            // reductive
            } else  {
                if (!existing) return state   
                const newFilters = state.navigationFilters.filter(it => it.artistId !== artistId)
                const newState = { ...state, navigationFilters: newFilters }
                console.log('newState post NAV_FILTER_ARTIST_CHANGE (Reductive)', newState )
                return newState
            }
        }
        case 'NAVIGATION_FILTER_ALBUM_CHANGE': {
            const artistId = action.artistId
            const albumId = action.albumId
            const mode = action.mode
            const existingArtist = state.navigationFilters.find(it => it.artistId === artistId)  
            const existingAlbum = existingArtist?.albumIds.find(it => it === albumId)
            if (mode === FilterMode.EXCLUSIVE) {
                const newState = { ...state, navigationFilters: [{ artistId, albumIds: [albumId] }] } 
                console.log('newState post NAV_FILTER_ALBUM_CHANGE (Exclusive)', newState)
                return newState
            } else if (mode === FilterMode.ADDITIVE) {
                if (existingAlbum) return state
                const albumIds = existingArtist?.albumIds || []  
                const newState= { ...state, navigationFilters: [...state.navigationFilters.filter(it => it.artistId !== artistId), { artistId, albumIds: [...albumIds, albumId] }] } 
                console.log('newState post NAV_FILTER_ALBUM_CHANGE (Additive)', newState)
                return newState
            // reductive
            } else  {
                if (!existingAlbum || !existingArtist) return state   
                const albumIds = existingArtist.albumIds.filter(it => it !== albumId)    
                const otherArtists = state.navigationFilters.filter(it => it.artistId !== artistId) 
                const newState = { ...state, navigationFilters: [...otherArtists, { artistId: existingArtist.artistId, albumIds }]  }
                console.log('newState post NAV_FILTER_ALBUM_CHANGE (Reductive)', newState)
                return newState
            }
        }
        case 'RATER_FILTER_CHANGE': {
            const newFilters = action.filters
            const mode = action.mode
            let raterFilters = state.raterFilters; 
            if (newFilters) {
                const artistIds = reconcileFilters(state.raterFilters.artistIds, newFilters.artistIds, mode)
                const albumIds = reconcileFilters(state.raterFilters.albumIds, newFilters.albumIds, mode) 
                const songIds = reconcileFilters(state.raterFilters.songIds, newFilters.songIds, mode) 
                const hideAll = (artistIds.length === 0 && albumIds.length === 0 && songIds.length === 0) 
                raterFilters = { hideAll, artistIds, albumIds, songIds }  
            }
            const newState = { ...state, raterFilters }
            console.log('newState post RATER_FILTER_CHANGE', newState)
            return newState
        }
    }
}