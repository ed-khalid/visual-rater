import { useDrag } from "react-dnd"
import React from 'react'
import { Album } from "../../../generated/graphql"
import { MusicStore } from '../../../music/MusicStore'
import { DragType } from "../../../models/DragType"

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

    return <li ref={drag} className="nav-row nav-row-album"> 
    <div className="wrapper flex center">
        <div className="left flex center">
            <img className="nav-item-thumbnail" src={album.thumbnail!} alt='' />  
            <span>{album.name}</span> 
        </div> 
        <div className="right flex center nav-row-actions">
            <button>GO TO</button>
            <button>ADD</button>
            <button style={{fontSize: '4px'}}>ADD ALL ALBUMS</button>
        </div>
    </div>
    </li>
}