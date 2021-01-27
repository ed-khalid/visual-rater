import React  from "react"
import './Dashboard.css'
import { Album, Artist } from "../../generated/graphql"
import { DashboardArtist } from "./ArtistDashboard"
import { DashboardAlbumSummary } from "./DashboardAlbumSummary"

interface Props {
    artists:Artist[]
    selectedAlbum:string|undefined
    onAlbumSelect:(albumId:string|undefined,artistId:string|undefined) => void
    selectedArtist:string|undefined
}

export const Dashboard = ({artists,selectedAlbum, selectedArtist, onAlbumSelect}:Props) => {

    const setAlbum =  (album:Album, artist:Artist) => {
        onAlbumSelect(album.id, artist.id)
    } 
    const onAlbumClose = () => {
        onAlbumSelect(undefined, undefined)
    } 

    return <div id="dashboard" className="flex-column">
        {artists && artists.map(artist =>  <DashboardArtist key={artist.id} onAlbumSelect={setAlbum} artist={artist} />)}
        {selectedAlbum && selectedArtist && <DashboardAlbumSummary onClose={onAlbumClose} artistName={artists.find(it => it.id === selectedArtist)!.name} album={artists.find(it => it.id === selectedArtist)?.albums?.find(it => it?.id === selectedAlbum )!} />}
    </div>

}
