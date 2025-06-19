
import { Album, Artist, useUpdateAlbumMutation, useUpdateArtistMutation } from "../../generated/graphql"
import { mapArtistScoreToUI} from "../../functions/scoreUI"
import './ArtistOverview.css'
import { useState } from "react"
import { ArtistMetadataWidget } from "../widgets/artist-metadata/ArtistMetadataWidget"
import { CareerTrajectoryWidget } from "../widgets/career-trajectory/CareerTrajectoryWidget"
import { Editable } from "../common/Editable"
import { VisualRaterButton } from "../common/VisRaterButton"
import { VisualRaterToggleButton } from "../common/VisRaterToggleButton"
import { OverviewLink } from "../../models/OverviewModels"

interface Props {
    artist:Omit<Artist, "albums"> & { albums: Omit<Album, "artist" | "songs">[]  }
    onClose:any
    onLinkClick:(link:OverviewLink) => void
}
export const ArtistOverview = ({artist, onClose, onLinkClick: onAlbumTitleClick}:Props) => {

    const [isEditMode, setEditMode] = useState<boolean>(false)
    const [updateArtistMutation, ] = useUpdateArtistMutation()
    const [updateAlbumMutation, ] = useUpdateAlbumMutation()


    const onArtistNameUpdate = (name:string) => {
        updateArtistMutation({variables: { artist: { id: artist.id, name } }})
    }
    const onAlbumNameUpdate = (id: string, name:string) => {
        updateAlbumMutation({variables: { album: { id, name } }})
    }

     const careerTrajectoryItems = artist.albums.map((album) => ({ value: album.score||0, thumbnail: album.thumbnail||'', label: album.name }))

    return <div className="artist-overview">
                <div className="header">
                    <div className="action-buttons">
                        <VisualRaterToggleButton additionalClassNames="overview-button" onClick={(_) => setEditMode(prev => !prev) } 
                        >
                            {isEditMode ? 'cancel' : 'edit'}
                        </VisualRaterToggleButton>
                    </div>
                    <div className="title">
                        {isEditMode ? <Editable onUpdate={(newValue:string) => onArtistNameUpdate(newValue) } fontSize={'26px'} fontWeight={600}  initialValue={artist.name} />: <>{artist.name}</>}
                    </div>
                    <div className="close-button">
                        <VisualRaterButton additionalClassNames="overview-button" onClick={(_) => onClose()} 
                        >
                            X
                        </VisualRaterButton>
                    </div>
                </div>
               <div style={{backgroundColor: mapArtistScoreToUI(artist.score || 0).color}}  className="tier">
                  <div  className="big-text">
                      { mapArtistScoreToUI(artist.score|| 0 ).category}
                  </div>
                  <div className="score">{artist.score}</div>
                </div>
               <div className="thumbnail">
                  <img className="thumbnail" src={artist.thumbnail!} alt="" />
               </div>
               <div className="metadata">
                <ArtistMetadataWidget metadata={artist.metadata} />
                <div className="metadata-songs-albums">
                     <div>songs</div>
                     <div>{artist.metadata?.totalSongs}</div>
                     <div>albums</div>
                     <div className="medium-text">{artist.metadata?.totalAlbums}</div>
                </div> 
               </div>
               <div className="career-trajectory">
                    <CareerTrajectoryWidget items={careerTrajectoryItems} />
               </div>
               <div className="albums">
                  <div className="header"><div className="title">Albums</div></div> 
                  <div className="list"> 
                  <ol>
                  {artist.albums.map( album => 
                     <li onClick={() => {}} key={"artist-" + artist.id + "-album-" + album.id + "-row"} className="album-row">
                        <div className="album-thumbnail"><img src={album.thumbnail || ''}/></div>
                        <div className="album-name" onClick={() => onAlbumTitleClick({ id: album.id, parentId: artist.id, type: 'album' })}>
                            {
                                isEditMode? 
                        <Editable onUpdate={(name:string) => onAlbumNameUpdate(album.id, name) } fontSize="16px" fontWeight={100} initialValue={album.name} />
                        : <>{album.name}</>
                            }
                        </div>
                        <div className="album-year">
                        {album.year}
                        </div>
                        <div className="album-score">
                        {album.score?.toFixed(1)}
                        </div>
                      </li>
                  )
                  }

                  </ol>
                 </div>
               </div>
             </div>
} 