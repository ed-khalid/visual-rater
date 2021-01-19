import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import './Dashboard.css'
import { Album, Artist, Maybe } from "../../generated/graphql"
import { DashboardArtist } from "./ArtistDashboard"
import { DashboardAlbumSummary } from "./DashboardAlbumSummary"

interface Props {
    artists:Artist[]
    openAlbumInSearch: Dispatch<SetStateAction<{album:Album,artist:Artist}|undefined>>
    soloRater:any
}

export const Dashboard = ({artists, openAlbumInSearch, soloRater}:Props) => {

    const [dashboardAlbum,setDashboardAlbum] = useState<Album>()
    const [dashboardArtist,setDashboardArtist] = useState<Artist>()

    useEffect(() => {
        const hasChosenAlbum = (it:Maybe<Album>) => it?.id === dashboardAlbum?.id    
        const chosenAlbumUpdated = artists.find(it => it.albums?.find(hasChosenAlbum))?.albums?.find(hasChosenAlbum)
        if (chosenAlbumUpdated) {
            setDashboardAlbum(chosenAlbumUpdated)
        }
    }, [artists, dashboardAlbum])

    const setAlbum =  (album:Album, artist:Artist) => {
        setDashboardAlbum(album)
        setDashboardArtist(artist)
    } 

    return <div id="dashboard" className="flex-column">
        {artists.map(artist =>  <DashboardArtist soloRater={soloRater} key={artist.id} onAlbumSelect={setAlbum} artist={artist} />)}
        {dashboardArtist && dashboardAlbum && <DashboardAlbumSummary openAlbumInSearch={() => openAlbumInSearch({album:dashboardAlbum,artist:dashboardArtist})} artistName={dashboardArtist.name} album={dashboardAlbum} />}
    </div>

}
