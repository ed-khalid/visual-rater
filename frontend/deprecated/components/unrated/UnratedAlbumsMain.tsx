import { UnratedAlbum } from "../../pages/UnratedPage"
import { UnratedAlbumOverview } from "./UnratedAlbumOverview"

export const UnratedAlbumsMain = ({album}: {album?:UnratedAlbum})  => {
    return (album) ? <div id="unrated-album-main-wrapper">
        <UnratedAlbumOverview album={album} />
    </div> : <div>Select an album from the left to rate it</div>
}