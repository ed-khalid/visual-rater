import { ComparisonSong, Maybe, Song } from "../generated/graphql";
import { ComparisonSongUIItem, SongUIItem } from "../models/CoreModels";


export const mapComparisonSongToComparisonSongUIItem = (comparisonSong:ComparisonSong, isTarget:boolean) : ComparisonSongUIItem => ({id:comparisonSong.id, albumId: "", artistId:"", name:comparisonSong.songName,score:comparisonSong.songScore, isMain:isTarget, artistName: comparisonSong.artistName, albumName:comparisonSong.albumName, thumbnail:comparisonSong.thumbnail! })   

export const mapSongToUIItem = (song: Song, album: { thumbnail?:Maybe<string>, thumbnailDominantColors?:Maybe<Array<string>>, name: string }, artist:{ name: string}): SongUIItem   => ({ id: song.id, artistId: song.artist.id, albumId: song.album.id, name: song.name , score:song.score!, thumbnail:album.thumbnail!, overlay:album.thumbnailDominantColors!, number:song.number,albumName:album.name, artistName:artist.name});
