import { useEffect, useState } from "react"
import { Album, Song, useGetAlbumsSongsQuery } from "../../../../../generated/graphql"
import { SortButton, SortDirection } from "../../../../common/SortButton"
import { useMusicDispatch } from "../../../../../hooks/MusicStateHooks"
import './SongsSubpanel.css' 
import { NavScoreInfo } from "../../NavScoreInfo"

interface Props {
    album: Album
}

export const SongsSubpanel = ({album}: Props) => {

    const musicDispatch = useMusicDispatch()

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





    return <div className="nav-item-subpanel">
                  <div className="nav-panel-header-item">
                        <div className="nav-panel-empty">
                            #
                        </div> 
                        <div className="nav-panel-header-main">
                            TITLE
                        </div>
                        <div className="nav-panel-header-second">
                            SCORE
                            <SortButton sortDirection={scoreSortDirection} flipDirection={scoreFlipDirection} />
                        </div> 
                </div> 

        { sortedTracks.map(song =>
        <div className="nav-panel-item song smaller">
          <div className="nav-item-number smaller">
                    {song.number}
             </div>
                <div className="nav-panel-item-info">
                    <div className="nav-panel-item-info-name smaller">
                  {song.name}
                    </div>
                </div>
                <NavScoreInfo item={song} type={'song'} />
        </div> 
        )
       }
    </div>
}