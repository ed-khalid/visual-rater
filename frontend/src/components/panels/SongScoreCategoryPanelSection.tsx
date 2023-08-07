import React from "react"
import { SongScoreCategory, SongScoreCategoryUI } from "../../models/ScoreTypes"

interface Props {
    songScoreCategories:SongScoreCategoryUI[]
    onClick:(category:SongScoreCategory) => void
}


export const SongScoreCategoryPanelSection = ({songScoreCategories, onClick}:Props) => {

    return <div className="songscorecategory-panelsection grid">
    {songScoreCategories.map((it,i) => 
            <React.Fragment key={"songscorecategory-"+i}>
                <div className="row label" onClick={()=> onClick(it.category)}>{it.category}</div>
                <div className="row value" onClick={()=> onClick(it.category)}>{it.value}</div>
            </React.Fragment>
        )}
    </div> 
    
}