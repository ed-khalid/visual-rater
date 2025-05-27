import { Dispatch, useEffect, useState } from "react"
import { Album, Artist, Song, useGetAlbumsSongsQuery } from "../../generated/graphql"
import './AlbumContext.css'
import { MusicAction } from "../../music/MusicAction"
import { mapArtistScoreToUI, mapSongScoreToUI } from "../../functions/scoreUI"
import { SimpleRater } from "../raters/simple/SimpleRater"

interface Props {
    artist: Artist
    album: Album
    musicDispatch: Dispatch<MusicAction>
}
export const AlbumContext = ({album, artist, musicDispatch}:Props) => {
    const { data, loading, error} = useGetAlbumsSongsQuery({ variables: { albumIds: [album.id]}})
    const [tracks,setTracks] = useState<Song[]>([]) 
    
    useEffect(() => {
        if (data?.albums?.at(0)?.songs) {
            musicDispatch({ type: 'DATA_CHANGE', data: { songs: data.albums[0].songs as Song[] }})
            setTracks([...data.albums[0].songs])
        }
    }, [data])

    const scoreCategory = mapArtistScoreToUI(album.score)


    return <div className="context-panel-content album">
            <div style={{backgroundColor: scoreCategory.color }} className="tier">
                <div className="big-text">
                {scoreCategory.category}
                    </div> 
                    <div className="score">
                {scoreCategory.score}
                    </div>
            </div>
            <div className="thumbnail">
                <img src={album.thumbnail || ''} alt="" />
            </div>
            <div className="album-year">{album.year}</div>
            <SimpleRater />
            <div className="album-tracks">
            <div className="title">Tracklist</div> 
            <div className="list">
                <ul>
                {tracks.map((track:Song) => <li key={"track-"+track.id} className="track-row">
                    <div className="track-number">{track.number}</div>
                    <div className="track-name">{track.name}</div>
                    <div className="track-score" style={{backgroundColor: mapSongScoreToUI(track.score).color }}>
                        <div className="track-score-value">
                            {track.score}
                        </div>
                        <div className="track-score-category">
                            {mapSongScoreToUI(track.score).category}
                        </div>
                    </div>
                </li>)}
                </ul>
            </div>

            </div>
    </div>

}