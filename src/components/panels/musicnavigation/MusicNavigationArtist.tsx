import React from "react"
import { Album, Artist } from "../../../generated/graphql"
import { MusicNavigationAlbumRow } from "./MusicNavigationAlbumRow"
import { DragType } from "../../../models/ui/DragType"
import { useDrag } from "react-dnd"
import { MusicStore } from "../../../music/MusicStore"


interface Props {
    artist:Artist
    albums?:Album[]
    artistToggleState:boolean|undefined
    store:MusicStore
    onAlbumSelect:(album:Album) => void
    toggleArtist:(artist:Artist) => void
}

export const MusicNavigationArtist = ({store,artist,artistToggleState, toggleArtist, onAlbumSelect, albums}:Props) => {

    const [ , drag ] = useDrag(() => ({
        type: DragType.ARTIST,
        item: { artist: artist }
    })) 

                    return <div className="flex col nav-artist-row" key={'nav-artist-'+artist.name}>
                        <div className="flex center nav-artist-row artist">
                            { !artistToggleState &&  <svg width="16px" height="16px">
                                <g cursor={"pointer"} onClick={() => toggleArtist(artist)}>
                                    <circle cx="8" cy="8" fill="transparent" stroke="black" r="7"  ></circle>
                                    <line x1="8" x2="8" y1="4" y2="13" stroke="black" /> 
                                    <line x1="4" x2="12" y1="8" y2="8" stroke="black" /> 
                                </g>
                            </svg>}
                            { artistToggleState &&  <svg width="16px" height="16px">
                                <g cursor={"pointer"} onClick={() => toggleArtist(artist)}>
                                    <circle cx="8" cy="8" fill="transparent" stroke="black" r="7"  ></circle>
                                    <line x1="4" x2="12" y1="8" y2="8" stroke="black" /> 
                                </g>
                            </svg>}
                            <img ref={drag} className="item-thumbnail nav-item-thumbnail draggable" src={artist.thumbnail!} alt='' />  
                            <span className="nav-item-name">
                            {artist.name}
                        </span>
                        </div> 
                        <div className="flex nav-artist-row albums">
                        {artistToggleState && store.getAlbumsForArtist(artist.id).map(album => <div key={'music-navigation-album-'+album.id} className="nav-artist-albums" >
                            <MusicNavigationAlbumRow album={album} onAlbumSelect={onAlbumSelect} />
                             </div> )}
                        </div> 
                        </div> 
} 