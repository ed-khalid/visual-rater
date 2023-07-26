import { createRef } from "react";
import { Album, Artist, ComparisonSong, Song } from "../generated/graphql";
import { RaterOrientation } from "../models/ui/RaterTypes";
import { AlbumUIItem, ComparisonSongUIItem, MusicUIItem, RatedSongUIItem, RaterUIItem, SongUIItem } from "../models/domain/ItemTypes";


export const mapComparisonSongToComparisonSongUIItem = (comparisonSong:ComparisonSong, isTarget:boolean) : ComparisonSongUIItem => ({id:comparisonSong.id,name:comparisonSong.songName,score:comparisonSong.songScore, isMain:isTarget, artistName: comparisonSong.artistName, albumName:comparisonSong.albumName, thumbnail:comparisonSong.thumbnail!, overlay:comparisonSong.albumDominantColor})   

export const mapArtistToUIItem = (artist: Artist): MusicUIItem => ({ id: artist.id, name: artist.name , score:artist.score!, thumbnail:artist.thumbnail!, overlay:  artist.dominantColor!})
export const mapAlbumToUIItem = (album: Album): AlbumUIItem => ({ id: album.id, artistName: album.artistName, name: album.name , score:album.score!, thumbnail:album.thumbnail!,overlay:album.dominantColor!})
export const mapSongToUIItem = (song: Song, album: Album, artist:Artist): SongUIItem   => ({ id: song.id, name: song.name , score:song.score!, thumbnail:album.thumbnail!, overlay:album.dominantColor!, number:song.number,albumName:album.name, artistName:artist.name});

export const mapSongToRaterUIItem = (song: Song, album: Album, artist:Artist, orientation: RaterOrientation): RatedSongUIItem   => ({id: song.id, name: song.name, score:song.score!, thumbnail:album.thumbnail!, tier: 1, overlay:album.dominantColor!, number:song.number, nodeRef:createRef(), albumName:album.name, artistName:artist.name, orientation:orientation});
export const mapAlbumToRaterUIItem = (album: Album, orientation: RaterOrientation): RaterUIItem => ({ id: album.id, name: album.name , score:album.score!, thumbnail:album.thumbnail!, tier: 1, nodeRef:createRef(), overlay:album.dominantColor!, orientation})
export const mapArtistToRaterUIItem = (artist: Artist, orientation: RaterOrientation): RaterUIItem => ({ id: artist.id, name: artist.name , score:artist.score!, thumbnail:artist.thumbnail!, tier:1,nodeRef:createRef(), overlay: artist.dominantColor!, orientation})