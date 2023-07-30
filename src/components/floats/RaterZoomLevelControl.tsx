import React from "react"
import { MusicZoomLevel } from "../../music/MusicState"
import './Floats.css'

interface Props {
    value:MusicZoomLevel
    onZoomChange:(newValue:MusicZoomLevel) => void
}

export const RaterZoomLevelControl = ({value, onZoomChange}:Props) => {

    const convertMusicZoomLevelToRangeNumber = () => {
        if (value === MusicZoomLevel.ARTIST) return 1
        if (value === MusicZoomLevel.ALBUM) return 2
        if (value === MusicZoomLevel.SONG) return 3

    }  

    const onSliderChange = (_val:string) => {
        console.log(_val)
        const val:number =  Number(_val) 
        if  (val === 1) onZoomChange(MusicZoomLevel.ARTIST) 
        else if  (val === 2) onZoomChange(MusicZoomLevel.ALBUM) 
        else if (val === 3) onZoomChange(MusicZoomLevel.SONG) 
    }  
    return <div id="rater-zoom-level-control" className="float flex col">
        <input onChange={(e) => onSliderChange(e.target.value)} name="rater-granularity" id="rater-granularity" type="range" min="1" max="3" step="1" list="markers" value={convertMusicZoomLevelToRangeNumber()} />
        <datalist id="markers">
            <option value="1" label="Artist"></option>
            <option value="2" label="Album"></option>
            <option value="3" label="Song"></option>
        </datalist>
        <label id="rater-zoom-level-control-label"  htmlFor="rater-granularity">Zoom Level</label>
    </div>

} 