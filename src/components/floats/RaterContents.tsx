import React from "react"
import { MusicState } from "../../music/MusicState"
import './Floats.css'

interface Props {
    musicState:MusicState
}

export const RaterContents = ({musicState}:Props) => {

    return <div id="rater-contents" className="float">
        RATER CONTENTS
    </div>

} 