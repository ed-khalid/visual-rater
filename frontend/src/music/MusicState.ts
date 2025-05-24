import { Album, Artist, Song } from "../generated/graphql"
import { MusicFilter } from "../models/ArtistNavigationFilter"

export type MusicEntity = Artist | Album | Song 
export type ScoreFilter = { start: number, end: number }

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