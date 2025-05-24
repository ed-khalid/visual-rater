import { Album, Artist } from "../generated/graphql"


export const DragType = {
    ALBUM: 'album',
    ARTIST: 'artist'
}


export type DraggableItem = {
    type: 'album|artist'
    id: string
}   

