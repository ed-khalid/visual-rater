import React from "react"
import { Panel } from "./Panel"
import { MusicState } from "../../music/MusicState"
import { MusicStore } from "../../music/MusicStore"
import { sortByScore } from "../../functions/sort"
import { mapScoreToUI } from "../../functions/scoreUI"

interface Props {
    musicState:MusicState
}


// music scope is SONG
export const BlockRaterPanel = ({musicState}:Props) => {

    const store = new MusicStore(musicState)
    const songs = sortByScore(store.getSongs())
    console.log(songs)

    return <Panel id="block-rater" className="relative" title="Block Rater">
        <ul>
            {songs.map(song => <li className="flex" key={'block-rater-item-' + song.id}>
              <img src={song.thumbnail} alt='?' className="block-rater-item-thumbnail"/> 
              <div className="block-rater-item-info">
                <div className="block-rater-item-songName">{song.name} </div>
                <div className="block-rater-item-artistName">{song.artistName}</div>
              <div className="block-rater-item-albumName">{song.albumName}</div>
              </div>
              <div style={{background: mapScoreToUI(song.score).color}} className="block-rater-item-rating flex column">
                <div className="block-rater-item-score">
                { 
                  mapScoreToUI(song.score).score  
                }
                </div>
                <div className="block-rater-item-score-descriptor">{mapScoreToUI(song.score).description}</div>
              </div> 
            </li> )}
        </ul>
    </Panel>
}   