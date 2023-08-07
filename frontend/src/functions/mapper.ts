import { createRef } from "react";
import { Album, Artist, ComparisonSong, Song } from "../generated/graphql";
import { AlbumUIItem, ComparisonSongUIItem, MusicUIItem, RatedSongUIItem, RaterUIItem, SongUIItem } from "../models/ItemTypes";


export const mapComparisonSongToComparisonSongUIItem = (comparisonSong:ComparisonSong, isTarget:boolean) : ComparisonSongUIItem => ({id:comparisonSong.id, albumId: "", artistId:"", name:comparisonSong.songName,score:comparisonSong.songScore, isMain:isTarget, artistName: comparisonSong.artistName, albumName:comparisonSong.albumName, thumbnail:comparisonSong.thumbnail!, overlay:comparisonSong.albumDominantColor})   

export const mapArtistToUIItem = (artist: Artist): MusicUIItem => ({ id: artist.id, name: artist.name , score:artist.score!, thumbnail:artist.thumbnail!, overlay:  artist.dominantColor!})
export const mapAlbumToUIItem = (album: Album): AlbumUIItem => ({ id: album.id, artistId: album.artistId,  artistName: album.artistName, name: album.name , score:album.score!, thumbnail:album.thumbnail!,overlay:album.dominantColor!})
export const mapSongToUIItem = (song: Song, album: Album, artist:Artist): SongUIItem   => ({ id: song.id, artistId: song.artistId, albumId: song.albumId, name: song.name , score:song.score!, thumbnail:album.thumbnail!, overlay:album.dominantColor!, number:song.number,albumName:album.name, artistName:artist.name});

export const mapSongToRaterUIItem = (song: Song, album: Album, artist:Artist): RatedSongUIItem   => ({id: song.id, name: song.name, score:song.score!, thumbnail:album.thumbnail!, tier: 1, overlay:album.dominantColor!, number:song.number, nodeRef:createRef(), artistId: artist.id, albumId: album.id, albumName:album.name, artistName:artist.name, shouldDrawLine:true });
export const mapAlbumToRaterUIItem = (album: Album): RaterUIItem => ({ id: album.id, name: album.name , score:album.score!, thumbnail:album.thumbnail!, tier: 1, nodeRef:createRef(), overlay:album.dominantColor!, shouldDrawLine:true})
export const mapArtistToRaterUIItem = (artist: Artist): RaterUIItem => ({ id: artist.id, name: artist.name , score:artist.score!, thumbnail:artist.thumbnail!, tier:1,nodeRef:createRef(), overlay: artist.dominantColor!, shouldDrawLine:true})


export const mapUIItemToRaterUIItem = (item:MusicUIItem, tier:number): RaterUIItem  => ({...item, tier, nodeRef: createRef(), shouldDrawLine:true})   