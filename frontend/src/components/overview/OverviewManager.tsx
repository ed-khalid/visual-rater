import { OverviewItem, OverviewLink } from "../../models/OverviewModels"
import { isAlbum, isArtist } from "../../music/MusicState"
import { AlbumOverview } from "./AlbumOverview"
import { ArtistOverview } from "./ArtistOverview"

interface Props {
    item:OverviewItem
    onClose:any
    onLinkClick:(link:OverviewLink) => void
}


export const OverviewManager = ({item , onClose, onLinkClick}: Props) => {

    if (isArtist(item.entity)) {
        return <div id="overview">
            <ArtistOverview artist={item.entity} onClose={onClose} onLinkClick={onLinkClick} />
        </div>
    } else if (isAlbum(item.entity)) {
        return <div id="overview">
            <AlbumOverview album={item.entity} artist={item.parentEntity!} onClose={onClose} onLinkClick={onLinkClick} />
        </div>
    }


}