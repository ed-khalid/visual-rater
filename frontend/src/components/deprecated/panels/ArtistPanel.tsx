import React from "react"
import { Artist } from "../../../generated/graphql"
import { mapArtistSongMetadataToSongScoreUI, mapArtistScoreToUI, mapSongScoreCategoryToScoreFilter } from "../../../functions/scoreUI"
import { SongScoreCategoryPanelSection } from "./SongScoreCategoryPanelSection"
import { SongScoreCategory } from "../../../models/ScoreTypes"
import { Panel } from "../../common/Panel"
import '../../common/Panel.css'

interface Props {
    artist:Artist
    onSongCategoryClick:(artist:Artist, scoreFilter:{start:number, end:number}) => void
}

export const ArtistPanel = ({artist, onSongCategoryClick}:Props) => {

   const onSongCategoryClickInternal = (category:SongScoreCategory) => {
      const scoreFilter = mapSongScoreCategoryToScoreFilter(category) 
      onSongCategoryClick(artist, scoreFilter)
   }  


    return <Panel className='relative details-panel' id="artists-panel" isCollapsible={true} title={artist.name}>
            <div className="outer-grid grid"> 
               <img className="thumbnail" src={artist.thumbnail!} alt="" />
               <div className="flex col">
                  <div className="big-text">
                      { mapArtistScoreToUI(artist.score|| 0 ).category}
                  </div>
                  <div className="artist-panel-subtitle">tier</div>
                </div>
               <div>
                  <div className="big-text">
                    {artist.metadata?.totalAlbums}
                  </div> 
                  <div className="artist-panel-subtitle">albums</div> 
               </div>
               <div className="songs">
                     <SongScoreCategoryPanelSection songScoreCategories={mapArtistSongMetadataToSongScoreUI(artist.metadata?.songs)} onClick={onSongCategoryClickInternal} />
               </div>
               <div>
                     <div className="medium-text">{artist.metadata?.totalSongs}</div>
                     <div>songs</div>
                  </div>
               </div>
        </Panel>
} 