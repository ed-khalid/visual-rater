import { Maybe, Song } from "../generated/graphql";

export interface Item {
    id:string
    name:string
}
export interface RatedItem extends Item {
    score:number;
} 
export interface MusicUIItem extends RatedItem {
    thumbnail?:string
    overlay?:Array<string>
} 
export interface AlbumUIItem extends MusicUIItem {
    artistName:string
    artistId:string
    year?:string
} 
export interface SongUIItem extends AlbumUIItem {
    albumName:string
    albumId:string
    number?:number
} 

export interface ComparisonSongUIItem extends SongUIItem {
       isMain:boolean 
}  

export interface ContextArtist {
    artist: {id:string, name:string, thumbnail?:Maybe<string>}
    albums: {id: string, name: string, thumbnail?:Maybe<string>}[]
}

export type FatSong = {
    artist: {name: string, id:string} 
    album: { thumbnail?: Maybe<string>, thumbnailDominantColors?:Maybe<Array<string>>, name:string}
    song: Song
} 

export type ArtistOrAlbum = 'artist'|'album' 


export const SCORE_START = 0  
export const SCORE_END = 100  