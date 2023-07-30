import { useDrag } from "react-dnd"
import React from 'react'
import { Album } from "../../../generated/graphql"
import { MusicStore } from '../../../music/MusicStore'
import { MusicScope } from '../../../music/MusicState'

interface Props  {
    album:Album
    store:MusicStore
    onAlbumSwitch:(album:Album) => void
    onAlbumAdd:(album:Album) => void
}


export const MusicNavigationAlbumRow = ({album, onAlbumAdd, onAlbumSwitch, store}:Props) => {

    const [ , drag ] = useDrag(() => ({
        type: DragType.ALBUM,
        item: { album: album }
    })) 


    return <div ref={drag} className="flex col center nav-album   "> 
        <img className="item-thumbnail nav-item-thumbnail" src={album.thumbnail!} alt='' />  
        <span>{album.name}</span> 
    </div>
}