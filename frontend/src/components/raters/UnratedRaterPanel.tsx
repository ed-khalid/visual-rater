import { mapSongToUIItem } from "../../functions/mapper"
import { FatSong } from "../../models/RaterModels"
import { GridRaterItemUI } from "./grid/GridRaterItemUI"
import './UnratedRaterPanel.css'

interface Props {
    items:FatSong[]
}

export const UnratedRaterPanel = ({items}:Props) => {

    return <div id="unrated-rater-panel">
        <div className="title">
            UNRATED
        </div>
        {items.map((unratedItem) => <GridRaterItemUI isUnrated={true} key={"unrated-item-"+unratedItem.song.id} item={mapSongToUIItem(unratedItem.song, unratedItem.album, unratedItem.artist)} />)}
    </div>
}