import { useState } from "react"
import { Album, Artist, GetAlbumsSongsDocument, Song, useUpdateAlbumMutation, useUpdateSongMutation } from "../../generated/graphql"
import './AlbumOverview.css'
import { mapAlbumScoreToUI, mapSongScoreToUI } from "../../functions/scoreUI"
import { VisualRaterToggleButton } from "../common/VisRaterToggleButton"
import { Editable } from "../common/Editable"
import { VisualRaterButton } from "../common/VisRaterButton"
import { OverviewLink } from "../../models/OverviewModels"
import { LinearRater } from "../raters/linear/LinearRater"

interface Props {
    album: Omit<Album, "artist"> & { "artist": Omit<Artist, "score"|"albums"|"metadata"> }
    onClose: () => void
    onLinkClick: (link:OverviewLink) => void
}
export const AlbumOverview = ({album, onClose, onLinkClick }:Props) => {
    const [isEditMode, setEditMode] = useState<boolean>(false)

    const [updateSongMutation, ] = useUpdateSongMutation()

    const [updateAlbumMutation, _ ] = useUpdateAlbumMutation() 

    const onAlbumNameUpdate = (name:string) => {
        updateAlbumMutation({variables: { album: { id: album.id, name} }})
    }
    

    const onArtistNameClick = () => {
        onLinkClick({ id: album.artist.id, type: 'artist' })
    }

    const onSongScoreUpdate = (song:Song) => {
        updateSongMutation({ variables: {song:  { id: song.id , score: song.score} }, refetchQueries: [{ query: GetAlbumsSongsDocument, variables: { albumIds: [album.id] }  }]})
    }




    const scoreCategory = mapAlbumScoreToUI(album.score)


    return <div className="album-overview">
            <div className="header">
                <div className="action-buttons">
                    <VisualRaterToggleButton additionalClassNames="overview-button" onClick={(_) => setEditMode(prev => !prev) } 
                    >
                        {isEditMode ? 'cancel' : 'edit'}
                    </VisualRaterToggleButton>
                </div>
                <div className="title">
                    <div onClick={() => onArtistNameClick()} className="artist-name">{album.artist.name}</div> 
                    <div className="separator">{' - '}</div>
                    {isEditMode ? <Editable onUpdate={(newValue:string) => onAlbumNameUpdate(newValue) } fontSize={'26px'} fontWeight={600}  initialValue={album.name} />: <>{album.name}</>}
                </div>
                <div className="close-button">
                    <VisualRaterButton additionalClassNames="overview-button" onClick={(_) => onClose()} 
                    >
                        X
                    </VisualRaterButton>
                </div>
            </div>
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
            <div className="rater">
                <div className="title">Ratings</div>
                <LinearRater items={album.songs} onScoreUpdate={onSongScoreUpdate}  />
            </div>
            <div className="album-tracks">
            <div className="title">Songs</div> 
            <div className="list">
                <ul>
                {album.songs.map((track:Song) => <li key={"track-"+track.id} className="track-row">
                    <div className="track-number">{track.number}</div>
                    <div className="track-name">{track.name}</div>
                    <div className="track-score" style={{backgroundColor: mapSongScoreToUI(track.score).color }}>
                        <div className="track-score-value">
                            {mapSongScoreToUI(track.score).score || 'U' }
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

