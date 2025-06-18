import { Maybe } from "../generated/graphql"

export type PlaylistFilters = {
  pageNumber: number
  artistIds: Maybe<string[]> 
  score: Maybe<number>
  albumIds: Maybe<string[]> 
}

export enum FilterMode { ADDITIVE, EXCLUSIVE, REDUCTIVE }