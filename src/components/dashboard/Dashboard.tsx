import React, { useEffect } from "react"
import './Dashboard.css'
import { Album, Artist, Maybe } from "../../generated/graphql"
import { DashboardArtist } from "./ArtistDashboard"
import { DashboardAlbumSummary } from "./DashboardAlbumSummary"

interface Props {
    artists:Artist[]
    selectedAlbum:Album|undefined
    onAlbumSelect:any
    selectedArtist:Artist|undefined
    onArtistSelect:any
}

export const Dashboard = ({artists,selectedAlbum, selectedArtist, onAlbumSelect, onArtistSelect }:Props) => {


    useEffect(() => {
        const hasChosenAlbum = (it:Maybe<Album>) => it?.id === selectedAlbum?.id    
        const chosenAlbumUpdated = artists.find(it => it.albums?.find(hasChosenAlbum))?.albums?.find(hasChosenAlbum)
        if (chosenAlbumUpdated) {
            onAlbumSelect(chosenAlbumUpdated)
        }
    }, [artists, selectedAlbum, onAlbumSelect])

    const setAlbum =  (album:Album, artist:Artist) => {
        onArtistSelect(artist)
        onAlbumSelect(album)
    } 
    const onAlbumClose = () => {
        onArtistSelect(undefined)
        onAlbumSelect(undefined)
    } 
     

    return <div id="dashboard" className="flex-column">
        {artists.map(artist =>  <DashboardArtist key={artist.id} onAlbumSelect={setAlbum} artist={artist} />)}
        {selectedAlbum && selectedArtist && <DashboardAlbumSummary onClose={onAlbumClose}  artistName={selectedArtist.name} album={selectedAlbum} />}
    </div>

}
