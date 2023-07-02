import React  from "react"
import './Dashboard.css'
import { Album, Artist } from "../../generated/graphql"
import { DashboardArtist } from "./ArtistDashboard"
import { DashboardAlbumSummary } from "./DashboardAlbumSummary"

interface Props {
    artists:Artist[]
    selectedAlbumId:string|undefined
    onAlbumSelect:(album:Album|undefined,artist:Artist|undefined) => void
    selectedArtistId:string|undefined
}

export const Dashboard = ({artists,selectedAlbumId, selectedArtistId , onAlbumSelect}:Props) => {
    const setAlbum =  (album:Album, artist:Artist) => {
        onAlbumSelect(album, artist)
    } 
    const onAlbumClose = () => {
        onAlbumSelect(undefined, undefined)
    } 

    return <div id="dashboard" className="flex-column">
        <div className="dashboard-section">
           {artists && artists.map(artist =>  <DashboardArtist key={artist.id} onAlbumSelect={setAlbum} artist={artist} />)}
        </div> 
        <div className="dashboard-section">
          {selectedAlbumId && selectedArtistId && <DashboardAlbumSummary onClose={onAlbumClose} artistName={artists.find(it => it.id === selectedArtistId)!.name} album={artists.find(it => it.id === selectedArtistId)?.albums?.find(it => it?.id === selectedAlbumId )!} />}
        </div>
    </div>

}
