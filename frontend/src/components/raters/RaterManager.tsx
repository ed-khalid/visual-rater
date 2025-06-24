import './RaterManager.css'
import { GridRater } from "./grid/GridRater"
import { Song, useUpdateSongMutation } from "../../generated/graphql"
import { RaterStyle } from "../../models/RaterModels"
import { PlaylistRater } from "./playlist/PlaylistRater"


interface Props {
    raterStyle:RaterStyle
}

export const RaterManager = ({raterStyle}:Props) => {

  const [updateSong]  = useUpdateSongMutation();

  const onScoreUpdate = (updatedSong:Song) => {
    updateSong({ variables: { song: { id: updatedSong.id, score: updatedSong.score  } }})
  } 

    return <div id="raters">
                {
                (raterStyle=== RaterStyle.GRID) ?  <GridRater onScoreUpdate={onScoreUpdate}  /> :
                (raterStyle=== RaterStyle.PLAYLIST) ? <PlaylistRater onScoreUpdate={onScoreUpdate} /> :
                <></>
                }
    </div>
    
} 