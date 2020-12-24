import { Album, AlbumSearchResult, Artist, ArtistSearchResult, SongInput } from "../generated/graphql";
import { Song } from "../models/music/Song";

export const mapper = {

    searchResultToResult:<T extends Album|Artist>(searchResult:AlbumSearchResult|ArtistSearchResult) : T   => {
        return {
            id: searchResult.id
            ,name: searchResult.name
            ,thumbnail: searchResult.images[2].url
        } as T
    } ,
    songUpdateToSong: (songUpdate:any, song:Song):Song  => {
        return {
            id: song.id 
            ,name: song.name
            ,data: {
                number: song.data.number,
                artist: {
                    id: songUpdate.artist.id 
                    ,name: songUpdate.artist.name
                } 
                ,album: {
                    id: songUpdate.album.id 
                    ,name: songUpdate.album.name
                }

            } 
        }
    },
    songToSongInput : (song:Song):SongInput => {
        const songInput:SongInput = {
            id: song.id
            ,name: song.name
            ,number: song.data?.number
            ,score: song.score as number
            ,artist : {
                id: song.data.artist.id
                ,name: song.data.artist.name
            }
        } 
        if (song.data.album) {
            songInput.album = {
                id: song.data.album?.id
                ,name: song.data.album?.name
            } 
        }
        return songInput
    }    
} 