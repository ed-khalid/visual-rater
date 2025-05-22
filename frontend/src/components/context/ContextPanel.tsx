import { Dispatch } from "react"
import { Album, Artist } from "../../generated/graphql"
import { AlbumContext } from "./AlbumContext"
import { ArtistContext } from "./ArtistContext"
import { MusicAction } from "../../music/MusicAction"
import './ContextPanel.css'

interface Props {
    classNames?: string
    onClose?: (panelModel:ContextPanelBaseModel) => void 
    onExpandAlbum?: (album:Album) => void
    onClickArtistName?: (artist:Artist) => void
    onToggle: any
    isCollapsed: boolean
    model: ContextPanelBaseModel
    musicDispatch: Dispatch<MusicAction>
}

export interface ContextPanelBaseModel {
    id: string
    title: string
    type: 'artist-panel'|'album-panel'   
    data: Artist|Album
}  

export type ContextPanelArtistModel = ContextPanelBaseModel & {
    data: Artist
} 
export type ContextPanelAlbumModel = ContextPanelBaseModel & {
    data: Album
    artist: Artist
} 

export const ContextPanel = ({isCollapsed, onExpandAlbum, onClickArtistName, classNames, onClose, onToggle, model, musicDispatch}:Props) => {
    let classes = 'context-panel' 
    if (classNames) {
        classes = [classes, classNames].join(' ')
    }
    if (isCollapsed) {
        classes += " collapsed" 
    }

    return  (isCollapsed) ? <div className={classes}>
        &nbsp;
        <div className="title" onClick={() => onToggle(model)}>
          {(model.type === 'artist-panel') ? model.title :
          <><div onClick={() => onClickArtistName!((model as ContextPanelAlbumModel).artist)  }>{(model as ContextPanelAlbumModel).artist.name}</div><div> - {model.title} </div></>
           }
        </div>
        </div> :   
        <div className={classes} >
            {onClose && <div className="context-panel-close-button" onClick={() => onClose(model)}>X</div>}
            <div className="title" onClick={() => onToggle(model)}>{model.title}</div> 
            <div className="context-panel-padding">
                {model.type === 'artist-panel' && <ArtistContext expandAlbum={onExpandAlbum!!} artist={model.data as Artist} musicDispatch={musicDispatch} />}
                {model.type === 'album-panel' && <AlbumContext artist={(model as ContextPanelAlbumModel).artist} album={model.data as Album}  musicDispatch={musicDispatch} />}
            </div>
        </div>
}