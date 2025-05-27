import React from "react"
import { UnratedAlbum } from "../../../pages/UnratedPage"
import { mapSongScoreToUI } from "../../../functions/scoreUI"

interface Props {
    album: UnratedAlbum
}

export const UnratedTracks = ({album}: Props) => {
    return <div className="album-details-panel">
                <div className="album-song-cell header-cell">
                    &nbsp;
                </div>
                <div className="album-song-cell header-cell">
                    #
                </div>
                <div className="album-song-cell header-cell">
                    Track Name
                </div>
                <div className="album-song-cell header-cell">
                    Score
                </div>
        { album.songs.map(song =>
        <React.Fragment key={"track-"+song.id}>
          <div className="album-song-controls">
                    &nbsp;
                </div>
                <div className="album-song-number">
                    {song.number}
                </div>
                <div className="album-song-name">
                  {song.name}
                </div>
                <div className="album-song-score" style={{background: mapSongScoreToUI(song.score).color }}>
                    <div className="album-song-score-text">
                        {song.score || 'N/A' }
                    </div>
                </div>
        </React.Fragment>)}
    </div> 
}