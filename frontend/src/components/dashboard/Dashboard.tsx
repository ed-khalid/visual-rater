import React, { useEffect, useState } from "react"
import './Dashboard.css'
import { Album, Artist, Maybe } from "../../generated/graphql"
import { DashboardArtist } from "./ArtistDashboard"
import { DashboardAlbumSummary } from "./DashboardAlbumSummary"

interface Props {
    artists:Artist[]
}


export const Dashboard = ({artists}:Props) => {

    const [chosenAlbum,setChosenAlbum] = useState<Album>()
    const [chosenArtist,setChosenArtist] = useState<Artist>()

    useEffect(() => {
        console.log('artists changed', artists)
        const hasChosenAlbum = (it:Maybe<Album>) => it?.id === chosenAlbum?.id    
        const chosenAlbumUpdated = artists.find(it => it.albums?.find(hasChosenAlbum))?.albums?.find(hasChosenAlbum)
        if (chosenAlbumUpdated) {
            setChosenAlbum(chosenAlbumUpdated)
        }
    }, [artists])

    const setAlbum =  (album:Album, artist:Artist) => {
        setChosenAlbum(album)
        setChosenArtist(artist)
    } 


    return <div id="dashboard" className="flex-column">
        {artists.map(artist =>  <DashboardArtist key={artist.id} onAlbumSelect={setAlbum} artist={artist} />)}
        {chosenAlbum && <DashboardAlbumSummary artistName={chosenArtist?.name} album={chosenAlbum} />}
    </div>

}
