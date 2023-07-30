import React from "react"
import { Album, Artist } from "../../../generated/graphql"
import { MusicNavigationAlbumRow } from "./MusicNavigationAlbumRow"
import { DragType } from "../../../models/ui/DragType"
import { useDrag } from "react-dnd"
import { MusicStore } from "../../../music/MusicStore"
import { ExpandButton } from "../../ui-items/ExpandButton"


interface Props {
    artist:Artist
    artistToggleState:boolean
    store:MusicStore
    onArtistSwitch:(artist:Artist) => void
    onArtistAdd:(artist:Artist) => void
    onAlbumSwitch:(album:Album) => void
    onAlbumAdd:(album:Album) => void
    toggleArtist:(artist:Artist) => void
}

export const MusicNavigationArtist = ({store,artist,artistToggleState, toggleArtist, onArtistSwitch, onArtistAdd, onAlbumSwitch, onAlbumAdd }:Props) => {
    const handleExpandButtonClick = (newval:boolean) =>  {
        toggleArtist(artist)
    } 

                    return <div style={{background:`url(${artist.thumbnail})`, backgroundSize: 'contain' }} className="flex col nav-artist-row" key={'nav-artist-'+artist.name}>
                        <div onClick={() => toggleArtist(artist) } className="flex center nav-row artist">
                            <ExpandButton theme="dark"  isExpanded={artistToggleState} setIsExpanded={handleExpandButtonClick} />
                            <div className="flex col">
                              <p className="nav-item-name">
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
                            <MusicNavigationAlbumRow album={album} onAlbumSwitch={onAlbumSwitch} onAlbumAdd={onAlbumAdd} store={store} />
                             </div> )}
                        </div> 
                        </div> 
} 