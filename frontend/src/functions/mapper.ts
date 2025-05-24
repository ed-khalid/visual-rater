import { ComparisonSong, Maybe, Song } from "../generated/graphql";
import { ComparisonSongUIItem, CartesianRaterItem, SongUIItem } from "../models/ItemTypes";
import { FatSong } from "../models/RaterTypes";


export const mapComparisonSongToComparisonSongUIItem = (comparisonSong:ComparisonSong, isTarget:boolean) : ComparisonSongUIItem => ({id:comparisonSong.id, albumId: "", artistId:"", name:comparisonSong.songName,score:comparisonSong.songScore, isMain:isTarget, artistName: comparisonSong.artistName, albumName:comparisonSong.albumName, thumbnail:comparisonSong.thumbnail!, overlay:comparisonSong.albumDominantColor})   

export const mapSongToUIItem = (song: Song, album: { thumbnail?:Maybe<string>, dominantColor?:Maybe<string>, name: string }, artist:{ name: string}): SongUIItem   => ({ id: song.id, artistId: song.artistId, albumId: song.albumId, name: song.name , score:song.score!, thumbnail:album.thumbnail!, overlay:album.dominantColor!, number:song.number,albumName:album.name, artistName:artist.name});

export const mapRaterItemToCartesianRaterItem = (fatSongs:FatSong[]): CartesianRaterItem[] =>  { 
    const songUIs = fatSongs.map(fatSong => mapSongToUIItem(fatSong.song, fatSong.album, fatSong.artist))
    return songUIs.map(it => ({...it, tier: undefined, nodeRef: undefined, shouldDrawLine: true}))
} 

export const mapSongToFatSong = (song:Song, album:{thumbnail?:Maybe<string>, dominantColor?:Maybe<string>, name:string }, artist:{name: string, id: string} ): FatSong  => {
    return {
        song,
        album,
        artist
    }

}