import { Album, Artist, Song } from "../generated/graphql"
import { MusicFilter } from "./MusicFilters"

export type MusicEntity = Artist | Album | Song 
export type ScoreFilter = { start: number, end: number }

export const isArtist = (entity:MusicEntity): entity is Artist => entity.__typename === 'Artist'
export const isAlbum = (entity:MusicEntity): entity is Album => entity.__typename === 'Album'
export const isSong = (entity:MusicEntity): entity is Song => entity.__typename === 'Song'
  


export type MusicState = {
  data: {
    artists: Artist[]
    albums: Album[],
    songs: Song[]
  }
  navigationFilters:MusicFilter[]
  ,
  raterFilters: {
    hideAll: boolean
    artistIds: string[]
    albumIds: string[]
    songIds: string[]
  }
}