import { useState } from "react"
import { Album, Artist, useGetAlbumsQuery } from "../../../generated/graphql"
import './ArtistAlbumsSubpanel.css'
import { AlbumSongsPanel } from "./AlbumSongsPanel"


interface Props {
    artist:Artist
}


export const ArtistAlbumsSubpanel = ({artist}: Props) => {

    const [selectedAlbums, setSelectedAlbums] = useState<Album[]>([])    

    const { data, loading, error } = useGetAlbumsQuery({ variables: {
        ids: artist.albums.map(it => it.id)
     }}) 

    const onAlbumSelect = (album:Album, e:React.MouseEvent<HTMLDivElement,MouseEvent>) => {
        e.preventDefault()
        if (selectedAlbums.includes(album)) {
            const newAlbums = selectedAlbums.filter(it => it.id !== album.id) 
            setSelectedAlbums(newAlbums)
        } else {
            const newAlbums = [...selectedAlbums, album]
            setSelectedAlbums(newAlbums)
        }
    }


    return <div className="artist-albums-subpanel">
        {data?.albums?.map(album => <div key={`artist-album-${album.id}`} className="musical-panel-expandable-item artist-album">
            <div className="artist-album-gap">&nbsp;</div> 
            <img className="artist-album-thumbnail" src={album.thumbnail!!} /> 
            <div className="artist-album-name" onClick={(e) => onAlbumSelect(album as Album, e)}>
                {album.name}
            </div>
            <div className="artist-album-year">
                {album.year}
            </div> 
            <div className="artist-album-score">
                {album.score}
            </div> 
        </div>)}
        {selectedAlbums.length > 0 && selectedAlbums.map(album => <AlbumSongsPanel album={album} />) } 
    </div>
}