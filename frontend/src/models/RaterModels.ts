import { Maybe } from "graphql/jsutils/Maybe"

export type RaterEntityRequest = {
    artistId: string
    albumId?: string
}   

export enum RaterStyle {
  GRID, LIST, LINEAR
}

export type RaterContextEntryModel = {
    id: string
    name: string
    thumbnail?: Maybe<string>
    isHidden: boolean
    type: 'artist'|'album'
    parentId: string|null
}