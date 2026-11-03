import './RaterManager.css'
import { GridRater } from "./grid/GridRater"
import { useSaveSongScore } from "../../hooks/SaveSongScoreHook"
import { SaveErrorBanner } from "../common/SaveErrorBanner"
import { RaterStyle } from "../../models/RaterModels"
import { PlaylistRater } from "./playlist/PlaylistRater"


interface Props {
    raterStyle:RaterStyle
}

export const RaterManager = ({raterStyle}:Props) => {

  const { saveScore: onScoreUpdate, error, dismissError } = useSaveSongScore()

    return <div id="raters">
                {
                (raterStyle=== RaterStyle.GRID) ?  <GridRater onScoreUpdate={onScoreUpdate}  /> :
                (raterStyle=== RaterStyle.PLAYLIST) ? <PlaylistRater onScoreUpdate={onScoreUpdate} /> :
                <></>
                }
                <SaveErrorBanner error={error} onDismiss={dismissError} />
    </div>
    
} 