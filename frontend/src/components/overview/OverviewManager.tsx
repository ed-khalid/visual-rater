import { useEffect } from "react"
import { useGetOverviewAlbumLazyQuery, useGetOverviewArtistLazyQuery } from "../../generated/graphql"
import { OverviewLink } from "../../models/OverviewModels"
import { AlbumOverview } from "./AlbumOverview"
import { ArtistOverview } from "./ArtistOverview"

interface Props {
    link:OverviewLink
    onClose:any
    onLinkClick:(link:OverviewLink) => void
}


export const OverviewManager = ({link , onClose, onLinkClick}: Props) => {

    const [$getArtist, $getArtistResult ] = useGetOverviewArtistLazyQuery()
    const [$getAlbum, $getAlbumResult ] = useGetOverviewAlbumLazyQuery()

    useEffect(() => {
    if (link.type === 'artist') {
        $getArtist({variables: { id : link.id } })
    }
    if (link.type === 'album') {
        $getAlbum({ variables: { id: link.id } })
    }

    }, [link])





        return <div id="overview">
    {$getArtistResult.data?.artist && 
            <ArtistOverview artist={$getArtistResult.data.artist} onClose={onClose} onLinkClick={onLinkClick} />
    }
    { $getAlbumResult.data?.album && 
            <AlbumOverview album={$getAlbumResult.data.album} onClose={onClose} onLinkClick={onLinkClick} />
     }
        </div>


}