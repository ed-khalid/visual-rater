import React  from "react"
import './Dashboard.css'
import { Album, Artist } from "../../generated/graphql"
import { DashboardArtist } from "./ArtistDashboard"
import { DashboardAlbumSummary } from "./DashboardAlbumSummary"

interface Props {
    artists:Artist[]
    selectedAlbum:Album|undefined
    onAlbumSelect:(album:Album|undefined,artist:Artist|undefined) => void
    selectedArtist:Artist|undefined
}

export const Dashboard = ({artists,selectedAlbum, selectedArtist, onAlbumSelect}:Props) => {

    const setAlbum =  (album:Album, artist:Artist) => {
        onAlbumSelect(album, artist)
    } 
    const onAlbumClose = () => {
        onAlbumSelect(undefined, undefined)
    } 
     

    return <div id="dashboard" className="flex-column">
        {artists && artists.map(artist =>  <DashboardArtist key={artist.id} onAlbumSelect={setAlbum} artist={artist} />)}
        {selectedAlbum && selectedArtist && <DashboardAlbumSummary onClose={onAlbumClose}  artistName={selectedArtist.name} album={selectedAlbum} />}
    </div>

}
