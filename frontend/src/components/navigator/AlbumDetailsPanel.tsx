import { Dispatch, useEffect, useState } from "react"
import './AlbumDetailsPanel.css' 
import { mapSongScoreToUI } from "../../functions/scoreUI"
import { Album, Song, useGetAlbumsSongsQuery } from "../../generated/graphql"
import { MusicAction } from "../../music/MusicAction"
import { SortButton, SortDirection } from "../ui-items/SortButton"
import React from "react"

interface Props {
    album: Album
    musicDispatch: Dispatch<MusicAction>
}

export const AlbumDetailsPanel = ({musicDispatch, album}: Props) => {

    const { data, loading, error} = useGetAlbumsSongsQuery({ variables: { albumIds: [album.id]}})
    const [trackSortDirection, setTrackSortDirection] = useState<SortDirection>("ascending")
    const [scoreSortDirection, setScoreSortDirection] = useState<SortDirection>("ascending")

    const [sortedTracks, setSortedTracks] = useState<Song[]>([])  

    const flipDirection = () => {
        if (trackSortDirection === "ascending") {
            setTrackSortDirection("descending")
        } else {
            setTrackSortDirection("ascending")
        }
        sort(true)
    }  
    const scoreFlipDirection = () => {
        if (scoreSortDirection === "ascending") {
            setScoreSortDirection("descending")
        } else {
            setScoreSortDirection("ascending")
        }
        sort(false)
    }  
    useEffect(() => {
        if (data?.albums?.at(0)?.songs) {
            musicDispatch({ type: 'DATA_CHANGE', data: { songs: data.albums[0].songs as Song[] }})
            setSortedTracks([...data.albums[0].songs])
        }
    }, [data])

    const sort = (byTrack:Boolean) => {
        if (byTrack) {
            if (trackSortDirection === "ascending") {
                setSortedTracks(sortedTracks.sort((a, b) => b.number - a.number))
            } else {
                setSortedTracks(sortedTracks.sort((a, b) => a.number - b.number))
            }
        } else {
            if (scoreSortDirection === "ascending") {
                setSortedTracks([...sortedTracks.sort((a, b) => (b.score && a.score) ? b.score - a.score : (b.score) ? b.score : (a.score) ? a.score : 0)])
            } else {
                setSortedTracks([...sortedTracks.sort((a, b) => (a.score && b.score) ? a.score - b.score : (b.score) ? b.score : (a.score) ? a.score : 0 )])
            }
        }
    } 





    return <div className="album-details-panel">
                <div className="album-song-cell header-cell">
                    &nbsp;
                </div>
                <div className="album-song-cell header-cell">
                    #
                    <SortButton sortDirection={trackSortDirection} flipDirection={flipDirection} />
                </div>
                <div className="album-song-cell header-cell">
                    Track Name
                </div>
                <div className="album-song-cell header-cell">
                    Score
                    <SortButton sortDirection={scoreSortDirection} flipDirection={scoreFlipDirection} />
                </div>

        { sortedTracks.map(song =>
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
        </React.Fragment>
        )
       }
    </div>
}