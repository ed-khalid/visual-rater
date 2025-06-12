import { mapSongToUIItem } from "../../functions/mapper"
import { Song } from "../../generated/graphql"
import { GridRaterItemUI } from "./grid/GridRaterItemUI"
import './UnratedRaterPanel.css'

interface Props {
    items:Song[]
}

export const UnratedRaterPanel = ({items}:Props) => {

    return <div id="unrated-rater-panel">
        <div className="title">
            UNRATED
        </div>
        {items.map((unratedItem) => <GridRaterItemUI isUnrated={true} key={"unrated-item-"+unratedItem.id} item={mapSongToUIItem(unratedItem, unratedItem.album, unratedItem.artist)} />)}
    </div>
}