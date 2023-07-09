import React, { useEffect, useState }  from "react"
import './Dashboard.css'
import { Album, Artist } from "../../generated/graphql"
import { DashboardArtist } from "./ArtistDashboard"
import { DashboardAlbumSummary } from "./DashboardAlbumSummary"

interface Props {
    artists:Artist[]
    artist:Artist|undefined
    album:Album|undefined
    onAlbumSelect:(album:Album|undefined, artist:Artist|undefined) => void
}

export const Dashboard = ({artists, album, artist, onAlbumSelect}:Props) => {

    const findArtist = () => {
        return artist?.name || 'Artist Name Not Found' 
    } 
    const onAlbumClose = () => {
        onAlbumSelect(undefined, undefined)
    } 

    const findAlbumFromStore = (album:Album): Album => { 
        const storeArtist = artists.find(it => it.id === artist?.id)
        if (storeArtist) {
            const storeAlbum = storeArtist.albums?.find(it => it?.id === album.id)
            return storeAlbum! 
        }
        return album
    } 



    return <div id="dashboard" className="flex-column">
        <div className="dashboard-section">
           {artists && artists.map(artist =>  <DashboardArtist key={artist.id} onAlbumSelect={onAlbumSelect} artist={artist} />)}
        </div> 
        <div className="dashboard-section">
          {album && <DashboardAlbumSummary onClose={onAlbumClose} artistName={findArtist()} album={findAlbumFromStore(album)} />}
        </div>
    </div>

}
