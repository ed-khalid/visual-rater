import React from "react"
import { Album, Artist } from "../../../generated/graphql"
import { MusicNavigationAlbumRow } from "./MusicNavigationAlbumRow"
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

                    return <React.Fragment>
                        <li className="nav-row flex center nav-row-artist">
                            <div onClick={() => toggleArtist(artist)} className="flex center left">
                            <ExpandButton theme="dark"  isExpanded={artistToggleState} setIsExpanded={handleExpandButtonClick} />
                            <img className="nav-item-thumbnail" src={artist.thumbnail!} alt='' />  
                            <span className="nav-item-name">
                                {artist.name}
                            </span>
                            </div>
                            <div className="right">
                                <div className="flex center nav-row-actions">
                                    <button onClick={() => onArtistSwitch(artist)}>GO TO</button>
                                    <button onClick={() => onArtistAdd(artist) }>ADD</button>
                                    <button onClick={() => onArtistAdd(artist) } style={{fontSize: '4px'}}>ADD ALL ALBUMS</button>
                                </div>
                            </div>
                        </li>
                        {artistToggleState && store.getAlbumsForArtist(artist.id).map(album => 
                            <MusicNavigationAlbumRow key={'music-navigation-album-row-'+ album.id } album={album} onAlbumSwitch={onAlbumSwitch} onAlbumAdd={onAlbumAdd} store={store} />
                             )}
                    </React.Fragment>
} 