import { SongInput } from "../generated/graphql";
import { Song } from "../models/music/Song";

export const mapper = {

    songToSongInput : (song:Song, score:number):SongInput => {
        // copy over identical props
        const songInput:SongInput = {
            id: song.id
            ,name: song.name
            ,trackNumber: song.trackNumber
            ,score
            ,artist : {
                id: song.artist.id
                ,name: song.artist.name
            }
        } 
        if (song.album) {
            songInput.album = {
                id: song.album?.id
                ,name: song.album?.name
            } 
        }
        return songInput
    }    
} 