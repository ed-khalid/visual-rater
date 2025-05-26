import { MusicEntity } from "../music/MusicState"

export type OverviewItem = {
    entity: MusicEntity
    parentEntity?: MusicEntity
}

export type OverviewLink = {
    id: string
    type: 'artist'|'album'
    parentId?: string 
} 