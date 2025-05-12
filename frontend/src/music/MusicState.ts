import { Album, Artist, Song } from "../generated/graphql"

export type MusicEntity = Artist | Album | Song 
export type ScoreFilter = { start: number, end: number }

export type MusicState = {
  data: {
    artists: Artist[]
    albums: Album[],
    songs: Song[]
  }
  , 
  raterFilters: {
    artistIds?: string[]
    albumIds?: string[]
    songIds?: string[]
    scoreFilter: { start: number, end: number }
  }
}