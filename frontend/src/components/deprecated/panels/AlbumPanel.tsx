import React from "react"
import { Album } from "../../../generated/graphql"
import { mapAlbumSongsToSongScoreUI, mapArtistScoreToUI, mapSongScoreCategoryToScoreFilter } from "../../../functions/scoreUI"
import { SongScoreCategoryPanelSection } from "./SongScoreCategoryPanelSection"
import { SongScoreCategory } from "../../../models/ScoreTypes"
import { Panel } from "../../common/Panel"

interface Props {
    album:Album
    onSongCategoryClick:(album:Album, scoreFilter:{start:number, end:number}) => void
}

export const AlbumPanel = ({album, onSongCategoryClick}:Props) => {

    const onSongCategoryClickInternal = (category:SongScoreCategory) => {
        const scoreFilter = mapSongScoreCategoryToScoreFilter(category)  
        onSongCategoryClick(album, scoreFilter) 
    } 


    return <Panel id="album-panel" className="relative details-panel" isCollapsible={true} title={album.name}>
    <div className="outer-grid grid">
         <img className="thumbnail" src={album.thumbnail!} alt={album.name}/>
         <div className="big-text">
          {mapArtistScoreToUI(album.score|| 0).category}
         </div>
        <div className="flex col">
            <div className="medium2-text">
                {album.year}
            </div>
        </div>
        <div className="songs">
          <SongScoreCategoryPanelSection songScoreCategories={mapAlbumSongsToSongScoreUI(album.songs)} onClick={onSongCategoryClickInternal} />
        </div>
    </div>
    </Panel>

}