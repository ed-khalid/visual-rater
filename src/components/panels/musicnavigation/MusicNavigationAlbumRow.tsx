import { useDrag } from "react-dnd"
import React from 'react'
import { Album } from "../../../generated/graphql"
import { DragType } from "../../../models/ui/DragType"

interface Props  {
    album:Album
    onAlbumSelect:any
}


export const MusicNavigationAlbumRow = ({album, onAlbumSelect}:Props) => {

    const [ , drag ] = useDrag(() => ({
        type: DragType.ALBUM,
        item: { album: album }
    })) 


    return <div ref={drag} className="flex col center nav-album   "> 
        <img className="item-thumbnail nav-item-thumbnail" src={album.thumbnail!} alt='' />  
        <span>{album.name}</span> 
    </div>
}