import React, { useState } from "react"
import { Album, Artist } from "../../../generated/graphql"
import { Panel } from "../Panel"
import { MusicState } from "../../../music/MusicState"
import { MusicNavigationArtist } from "./MusicNavigationArtist"
import { MusicStore } from "../../../music/MusicStore"

interface Props {
    artists:Artist[]
    state:MusicState
    onArtistExpand:(artist:Artist) => void
    onArtistSwitch:(artist:Artist) => void
    onArtistAdd:(artist:Artist) => void
    onAlbumSwitch:(album:Album) => void
    onAlbumAdd:(album:Album) => void
}


export const MusicNavigationPanel =  ({state, artists, onArtistExpand, onArtistSwitch, onArtistAdd, onAlbumSwitch, onAlbumAdd}:Props) => {

    const [ artistToggle, setArtistToggle] = useState<Map<string, boolean>>(new Map())

    const toggleArtist = (artist:Artist) => {
        const artistToggleState = artistToggle.get(artist.id)
        if (!artistToggleState) {
            onArtistExpand(artist)
        }
        setArtistToggle(toggle => new Map(artistToggle.set(artist.id, !artistToggleState)) )
    } 
    const store = new MusicStore(state) 

    return <Panel id="music-navigation" className='rightside-panel' title={'Music Navigation'} isCollapsible={true}>
                <ul id="nav-artists" className="flex col">
                    {state.data.artists.map(artist => 
                    <MusicNavigationArtist key={'music-navigation-artist-'+artist.id} store={store} onArtistSwitch={onArtistSwitch} onArtistAdd={onArtistAdd} onAlbumAdd={onAlbumAdd} onAlbumSwitch={onAlbumSwitch} artistToggleState={artistToggle.get(artist.id) || false} artist={artist} toggleArtist={toggleArtist} />
                    )}

                        {/* {  (artist.albums!.length > ALBUMS_PER_ARTIST) &&  <div className={`dashboard-albums-navigation flex-column ${(pageNumber === 1) ? 'disabled': '' }`} >
                            <FontAwesomeIcon onClick={() => setPageNumber(pageNumber-1)} icon={faArrowLeft}></FontAwesomeIcon>
                        </div>}
                        <div className="dashboard-albums-content flex">
                            {sortAlbums(artist.albums).slice(ALBUMS_PER_ARTIST *(pageNumber-1), Math.min(pageNumber *(ALBUMS_PER_ARTIST), artist.albums!.length) ).map(album => 
                            (album) ?  <ArtistDashboardAlbumRow key={album.id} album={album} onAlbumSelect={onAlbumSelectInternal}/>
                            : <div>nothing</div> 
                            )}
                        </div>
                        { (artist.albums!.length > ALBUMS_PER_ARTIST) && <div className={`dashboard-albums-navigation flex-column ${pageNumber*ALBUMS_PER_ARTIST >= artist?.albums!.length? "disabled":"" }`}>
                            <FontAwesomeIcon onClick={() => setPageNumber(pageNumber+1)} icon={faArrowRight}></FontAwesomeIcon>
                        </div>} */}
                </ul>
    </Panel>

}