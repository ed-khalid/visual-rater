import { Maybe } from "../generated/graphql"

export type SongFilters = {
  artistIds: Maybe<string[]> 
  albumIds: Maybe<string[]> 
}

export type PlaylistFilters = {
  pageNumber: number
} 

export type GridFilters = {
  pageNumber: number
}

export enum FilterMode { ADDITIVE, EXCLUSIVE, REDUCTIVE }