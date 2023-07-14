import { useDrag } from "react-dnd"
import React from 'react'
import { Album } from "../../../generated/graphql"
import { DragType } from "../../../models/ui/DragType"


export interface ArtistDashboardAlbumRowProps  {
    album:Album
    onAlbumSelect:any
}


export const ArtistDashboardAlbumRow = ({album, onAlbumSelect}:ArtistDashboardAlbumRowProps) => {

    const [ , drag ] = useDrag(() => ({
        type: DragType.ALBUM,
        item: { album: album }
    })) 



    return <div ref={drag} key={album.id} onClick={() => onAlbumSelect(album) } className="dashboard-album draggable">
                                <img alt={album?.name} src={album?.thumbnail || ''} />
            </div> 
}