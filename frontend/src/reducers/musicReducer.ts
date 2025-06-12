import { Album, Artist, Song } from "../generated/graphql";
import { MusicAction } from "../music/MusicAction";
import { AlbumRaterFilter, FilterMode, RaterFilter } from "../music/MusicFilterModels";
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
        case 'NAVIGATION_FILTER_ARTIST_CHANGE': {
            const artistId = action.artistId
            const mode = action.mode
            const existing = state.navigationFilters.find(it => it.artistId === artistId)  
            if (mode === FilterMode.EXCLUSIVE) {
                const albumIds  = existing?.albumIds || []  
                return {...state, navigationFilters: [{ artistId, albumIds }] } 
            } else if (mode === FilterMode.ADDITIVE) {
                if (existing) return state
                const newState:MusicState = { ...state, navigationFilters: [...state.navigationFilters, { artistId, albumIds: [] }] } 
                return newState
            // reductive
            } else  {
                if (!existing) return state   
                const newFilters = state.navigationFilters.filter(it => it.artistId !== artistId)
                const newState:MusicState = { ...state, navigationFilters: newFilters }
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
                const newState:MusicState = { ...state, navigationFilters: [{ artistId, albumIds: [albumId] }] } 
                return newState
            } else if (mode === FilterMode.ADDITIVE) {
                if (existingAlbum) return state
                const albumIds = existingArtist?.albumIds || []  
                const newState:MusicState = { ...state, navigationFilters: [...state.navigationFilters.filter(it => it.artistId !== artistId), { artistId, albumIds: [...albumIds, albumId] }] } 
                return newState
            // reductive
            } else  {
                if (!existingAlbum || !existingArtist) return state   
                const albumIds = existingArtist.albumIds.filter(it => it !== albumId)    
                const otherArtists = state.navigationFilters.filter(it => it.artistId !== artistId) 
                const newState:MusicState = { ...state, navigationFilters: [...otherArtists, { artistId: existingArtist.artistId, albumIds }]  }
                return newState
            }
        }

        case 'RATER_FILTER_ARTIST_CHANGE': {
            const artistId = action.artistId
            const albumIds = action.albumIds 
            const mode = action.mode
            const existing = state.raterFilters.find(it => it.artistId === artistId) 
            const albumFilters  = existing?.albums ||  albumIds.map(albumId => new AlbumRaterFilter(albumId, []))    
            if (mode === FilterMode.EXCLUSIVE) {
                return {...state, raterFilters: [new RaterFilter(artistId, albumFilters)] } 
            } else if (mode === FilterMode.ADDITIVE) {
                if (existing) return state
                const newState:MusicState = { ...state, raterFilters: [...state.raterFilters, new RaterFilter(artistId, albumFilters)] } 
                return newState
            // reductive
            } else  {
                if (!existing) return state   
                const newFilters = state.raterFilters.filter(it => it.artistId !== artistId)
                const newState:MusicState = { ...state, raterFilters: newFilters }
                return newState
            }
        }
        case 'RATER_FILTER_ALBUM_CHANGE': {
            const artistId = action.artistId
            const albumId = action.albumId
            const mode = action.mode
            const existingArtist = state.raterFilters.find(it => it.artistId === artistId)  
            const existingAlbum = existingArtist?.albums.find(it => it.albumId === albumId)
            const albumFilter = existingAlbum ? existingAlbum: new AlbumRaterFilter(albumId, [])   
            if (mode === FilterMode.EXCLUSIVE) {
                const newState:MusicState = { ...state, raterFilters: [ new RaterFilter(artistId, [albumFilter]) ]} 
                return newState
            } else if (mode === FilterMode.ADDITIVE) {
                if (existingAlbum) return state
                const albumFilters = existingArtist?.albums || [] 
                const newState:MusicState = { ...state ,raterFilters: [...state.raterFilters.filter(it => it.artistId !== artistId), new RaterFilter(artistId, [...albumFilters, albumFilter ]  ) ] } 
                return newState
            // reductive
            } else  {
                if (!existingAlbum || !existingArtist) return state   
                const albumFilters = existingArtist.albums.filter(it => it.albumId !== albumId)    
                const otherArtists = state.raterFilters.filter(it => it.artistId !== artistId) 
                if (albumFilters.length === 0) {
                    return { ...state, raterFilters: [...otherArtists] } 
                } else {
                    const newState:MusicState = { ...state, raterFilters: [...otherArtists, new RaterFilter(artistId, albumFilters) ]  }
                    return newState
                }
            }

        }
    }
}