import React  from "react"
import './Dashboard.css'
import { Album, Artist } from "../../generated/graphql"
import { DashboardArtist } from "./ArtistDashboard"
import { DashboardAlbumSummary } from "./DashboardAlbumSummary"

interface Props {
    artists:Artist[]
    selectedAlbumId:string|undefined
    onAlbumSelect:(albumId:string|undefined,artistId:string|undefined) => void
    selectedArtistId:string|undefined
}

export const Dashboard = ({artists,selectedAlbumId, selectedArtistId , onAlbumSelect}:Props) => {
    const setAlbum =  (album:Album, artist:Artist) => {
        onAlbumSelect(album.id, artist.id)
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
