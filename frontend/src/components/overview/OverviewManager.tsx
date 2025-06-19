import { useEffect, useState } from "react"
import { useGetOverviewAlbumLazyQuery, useGetOverviewArtistLazyQuery } from "../../generated/graphql"
import { OverviewLink } from "../../models/OverviewModels"
import { AlbumOverview } from "./AlbumOverview"
import { ArtistOverview } from "./ArtistOverview"

interface Props {
    link:OverviewLink
    onClose:any
    onLinkClick:(link:OverviewLink) => void
}

export type ArtistOrAlbum = 'artist' | 'album' 


export const OverviewManager = ({link , onClose, onLinkClick}: Props) => {

    const [$getArtist, $getArtistResult ] = useGetOverviewArtistLazyQuery()
    const [$getAlbum, $getAlbumResult ] = useGetOverviewAlbumLazyQuery()

    const [mode, setMode] = useState<ArtistOrAlbum>('artist') 

    useEffect(() => {
    if (link.type === 'artist') {
        $getArtist({variables: { id : link.id } })
        setMode('artist')
    }
    if (link.type === 'album') {
        $getAlbum({ variables: { id: link.id } })
        setMode('album')
    }

    }, [link])





        return <div id="overview">
    {mode === 'artist' && $getArtistResult.data?.artist && 
            <ArtistOverview artist={$getArtistResult.data.artist} onClose={onClose} onLinkClick={onLinkClick} />
    }
    { mode === 'album' && $getAlbumResult.data?.album && 
            <AlbumOverview album={$getAlbumResult.data.album} onClose={onClose} onLinkClick={onLinkClick} />
     }
        </div>


}