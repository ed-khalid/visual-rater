
export interface Item {
    id:string
    name:string
}
export interface RatedItem extends Item {
    score:number;
} 
export interface MusicUIItem extends RatedItem {
    thumbnail?:string
    overlay:string
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
export type RaterTier = number
export interface RaterUIItem extends MusicUIItem {
    tier:RaterTier
    nodeRef:any 
    shouldDrawLine:boolean
}

export interface ComparisonSongUIItem extends SongUIItem {
       isMain:boolean 
}  

export type RatedSongUIItem = RaterUIItem & SongUIItem     

export const SCORE_START = 0  
export const SCORE_END = 100  