import { Album, Artist, useGetAlbumsQuery } from "../../generated/graphql"
import { mapArtistSongMetadataToSongScoreUI, mapArtistScoreToUI} from "../../functions/scoreUI"
import './ArtistContext.css'
import { Dispatch, useEffect, useState } from "react"
import { MusicAction } from "../../music/MusicAction"

interface Props {
    artist:Artist
    expandAlbum: (album:Album) => void
    musicDispatch: Dispatch<MusicAction>
}
export const ArtistContext = ({artist, musicDispatch, expandAlbum}:Props) => {

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


    return <div className="context-panel-content artist">
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
                     {mapArtistSongMetadataToSongScoreUI(artist.metadata?.songs).map(it => <>
                     <div className="metadata-cell category" key={"artist-"+artist.id+"-song-score-"+it.category}>{it.category}</div>
                     <div className="metadata-cell value" key={"artist-"+artist.id+"-song-score-"+it.category+"-value"}>{it.value}</div>
                     </>)}
                     <div>songs</div>
                     <div>{artist.metadata?.totalSongs}</div>
                     <div>albums</div>
                     <div className="medium-text">{artist.metadata?.totalAlbums}</div>
               </div>
               <div className="albums">
                  <div className="title">Albums</div> 
                  <div className="list"> 
                  <ul>
                  {sortedAlbums.map((album:Album) => 
                     <li onClick={() => expandAlbum(album)} key={"artist-" + artist.id + "-album-" + album.id + "-row"} className="album-row">
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