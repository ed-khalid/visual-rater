import React, { useState } from "react"
import { Album, Artist, Maybe } from "../../../generated/graphql"
import { Panel } from "../Panel"
import { MusicFilters, MusicState, MusicStore } from "../../../models/domain/MusicState"
import { MusicNavigationArtist } from "./MusicNavigationArtist"

interface Props {
    artists:Artist[]
    state:MusicState
    onAlbumSelect:(album:Album) => void
    onArtistExpand:(artist:Artist) => void
}


export const MusicNavigationPanel =  ({state, artists, onAlbumSelect, onArtistExpand}:Props) => {

    const [ artistToggle, setArtistToggle] = useState<Map<string, boolean>>(new Map())

    // const onAlbumSelectInternal = (album:Album, artist:Artist) => {
    //     onAlbumSelect(album, artist)
    // } 
    const sortAlbums =(albums?:Maybe<Album>[]|null) : Maybe<Album>[] => {
        if (albums) {
            return [...albums].sort(byYear)
        }
        return []
    }
    const toggleArtist = (artist:Artist) => {
        const artistToggleState = artistToggle.get(artist.id)
        if (!artistToggleState) {
            onArtistExpand(artist)
        }
        setArtistToggle(toggle => new Map(artistToggle.set(artist.id, !artistToggleState)) )
    } 
    const byYear=(a:Maybe<Album>,b:Maybe<Album>) : number  => {
        if (a && b && a.year && b.year) {
            if (a.year < b.year) {
                return -1;
            }
            if (a.year > b.year) {
                return 1;
            }
        }
        return 0; 
    } 
    const store = new MusicStore(state.data, new MusicFilters(state.filters))

    return <Panel id="music-navigation" className='rightside-panel artist-albums' title={'Music Navigation'}>
                <div id="nav-artists" className="flex col">
                    {state.data.artists.map(artist => 
                    <MusicNavigationArtist store={store} onAlbumSelect={onAlbumSelect} artistToggleState={artistToggle.get(artist.id)} artist={artist} toggleArtist={toggleArtist} />
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
                </div>
    </Panel>

}