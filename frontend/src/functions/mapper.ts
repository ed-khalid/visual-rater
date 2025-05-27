import { ComparisonSong, Maybe, Song } from "../generated/graphql";
import { ComparisonSongUIItem, FatSong, SongUIItem } from "../models/CoreModels";


export const mapComparisonSongToComparisonSongUIItem = (comparisonSong:ComparisonSong, isTarget:boolean) : ComparisonSongUIItem => ({id:comparisonSong.id, albumId: "", artistId:"", name:comparisonSong.songName,score:comparisonSong.songScore, isMain:isTarget, artistName: comparisonSong.artistName, albumName:comparisonSong.albumName, thumbnail:comparisonSong.thumbnail!, overlay:comparisonSong.albumDominantColor})   

export const mapSongToUIItem = (song: Song, album: { thumbnail?:Maybe<string>, dominantColor?:Maybe<string>, name: string }, artist:{ name: string}): SongUIItem   => ({ id: song.id, artistId: song.artistId, albumId: song.albumId, name: song.name , score:song.score!, thumbnail:album.thumbnail!, overlay:album.dominantColor!, number:song.number,albumName:album.name, artistName:artist.name});


export const mapSongToFatSong = (song:Song, album:{thumbnail?:Maybe<string>, dominantColor?:Maybe<string>, name:string }, artist:{name: string, id: string} ): FatSong  => {
    return {
        song,
        album,
        artist
    }

}