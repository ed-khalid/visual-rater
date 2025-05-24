import React from "react"
import { SongScoreCategory, SongScoreCategoryUI } from "../../../models/ScoreTypes"

interface Props {
    songScoreCategories:SongScoreCategoryUI[]
}


export const SongScoreCategoryPanelSection = ({songScoreCategories}:Props) => {

    return <div className="songscorecategory-panelsection grid">
    {songScoreCategories.map((it,i) => 
            <React.Fragment key={"songscorecategory-"+i}>
                <div className="row label" >{it.category}</div>
                <div className="row value" >{it.value}</div>
            </React.Fragment>
        )}
    </div> 
    
}