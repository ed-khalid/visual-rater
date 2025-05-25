
import { Album, Artist, useGetAlbumsQuery } from "../../generated/graphql"
import { mapArtistScoreToUI} from "../../functions/scoreUI"
import './ArtistOverview.css'
import { useEffect, useState } from "react"
import { useMusicDispatch } from "../../hooks/MusicStateHooks"
import { ArtistMetadataWidget } from "../widgets/artist-metadata/ArtistMetadataWidget"
import { CareerTrajectoryWidget } from "../widgets/career-trajectory/CareerTrajectoryWidget"

interface Props {
    artist:Artist
}
export const ArtistOverview = ({artist}:Props) => {

    const musicDispatch  = useMusicDispatch()
     

    const [sortedAlbums ,setSortedAlbums] = useState<Album[]>([]) 
    const { data, loading, error } = useGetAlbumsQuery({ variables: {
        ids: artist.albums.map((it:any) => it.id)
     }}) 

     useEffect(() => {
        if (data?.albums) {
            musicDispatch({ type: 'DATA_CHANGE', data: { albums: data.albums as Album[] }})
            const sorted = [...(data?.albums!)].sort((a,b) => a.year! - b.year! )
            setSortedAlbums(sorted as Album[])
        }

     }, [data])

     const careerTrajectoryItems = sortedAlbums.map((album) => ({ value: album.score||0, thumbnail: album.thumbnail||'', label: album.name }))

    return <div className="artist-overview">
        <div className="title">{artist.name}</div>
               <div className="thumbnail">
                  <img className="thumbnail" src={artist.thumbnail!} alt="" />
               </div>
               <div style={{backgroundColor: mapArtistScoreToUI(artist.score || 0).color}}  className="tier flex col">
                  <div  className="big-text">
                      { mapArtistScoreToUI(artist.score|| 0 ).category}
                  </div>
                  <div className="score">{artist.score}</div>
                </div>
               <div className="metadata">
                <ArtistMetadataWidget metadata={artist.metadata} />
                     <div>songs</div>
                     <div>{artist.metadata?.totalSongs}</div>
                     <div>albums</div>
                     <div className="medium-text">{artist.metadata?.totalAlbums}</div>
               </div>
               <div className="career-trajectory">
                    <CareerTrajectoryWidget items={careerTrajectoryItems} />
               </div>
               <div className="albums">
                  <div className="title">Albums</div> 
                  <div className="list"> 
                  <ul>
                  {sortedAlbums.map((album:Album) => 
                     <li onClick={() => {}} key={"artist-" + artist.id + "-album-" + album.id + "-row"} className="album-row">
                        <div className="album-thumbnail"><img src={album.thumbnail || ''}/></div>
                        <div className="album-name">
                        {album.name}
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

                  </ul>
                 </div>
               </div>
             </div>
} 