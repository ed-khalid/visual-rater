import React, { Dispatch } from "react"
import { Panel } from "./Panel"
import { MusicZoomLevel, MusicState } from "../../../music/MusicState"
import { MusicStore } from "../../../music/MusicStore"
import { sortByScore } from "../../../functions/sort"
import { mapArtistScoreToUI, mapSongScoreToUI } from "../../../functions/scoreUI"
import { AlbumUIItem, MusicUIItem, SongUIItem } from "../../../models/ItemTypes"
import { MusicAction } from "../../../music/MusicAction"

interface Props {
    musicState:MusicState
    musicDispatch:Dispatch<MusicAction> 
}


interface ArtistBlockProps {
  items:MusicUIItem[]
  onClick:(zoomLevel:MusicZoomLevel, artistId:string, albumId?:string) => void
}
interface AlbumBlockProps {
  items:AlbumUIItem[]
  onClick:(zoomLevel:MusicZoomLevel, artistId:string, albumId?:string) => void
}
interface SongBlockProps {
  items:SongUIItem[]
  onClick:(zoomLevel:MusicZoomLevel, artistId:string, albumId?:string) => void
}
const ArtistBlockDetails = ({items,onClick}:ArtistBlockProps) => {
                return <React.Fragment>
                {items.map(artist => <li onClick={() => onClick(MusicZoomLevel.ARTIST, artist.id) } className="flex" key={'block-rater-item-' + artist.id}>
                  <img src={artist.thumbnail} alt='?' className="block-rater-item-thumbnail"/> 
                  <div className="block-rater-item-info">
                    <div className="block-rater-item-name">{artist.name} </div>
                  </div>
                  <div style={{background: mapArtistScoreToUI(artist.score).color}} className="block-rater-item-rating flex column">
                    <div className="block-rater-item-score">
                    { 
                      mapArtistScoreToUI(artist.score).category  
                    }
                    </div>
                    <div className="block-rater-item-score-descriptor">{mapArtistScoreToUI(artist.score).score}</div>
                  </div> 
                </li> )}
                </React.Fragment> 
}  
const AlbumBlockDetails = ({items, onClick}:AlbumBlockProps) => {
                return <React.Fragment>
                {items.map(album => <li onClick={() => onClick(MusicZoomLevel.ALBUM, album.artistId, album.id)} className="flex" key={'block-rater-item-' + album.id}>
                  <img src={album.thumbnail} alt='?' className="block-rater-item-thumbnail"/> 
                  <div className="block-rater-item-info">
                    <div className=" block-rater-item-info-primary block-rater-item-name">{album.name} </div>
                    <div className="block-rater-item-artistName">{album.artistName}</div>
                  <div className="block-rater-item-year">{album.year}</div>
                  </div>
                  <div style={{background: mapArtistScoreToUI(album.score).color}} className="block-rater-item-rating flex column">
                    <div className="block-rater-item-score">
                    { 
                      mapArtistScoreToUI(album.score).category  
                    }
                    </div>
                    <div className="block-rater-item-score-descriptor">{mapArtistScoreToUI(album.score).score}</div>
                  </div> 
                </li> )}
                </React.Fragment> 
}  

export const SongBlockDetails = ({items, onClick}:SongBlockProps) => {
                return <React.Fragment>
                {items.map(song => <li onClick={() => onClick(MusicZoomLevel.SONG, song.artistId, song.albumId )} className="flex" key={'block-rater-item-' + song.id}>
                  <img src={song.thumbnail} alt='?' className="block-rater-item-thumbnail"/> 
                  <div className="block-rater-item-info">
                    <div className="block-rater-item-songName block-rater-item-info-primary">{song.name} </div>
                    <div className="block-rater-item-artistName">{song.artistName}</div>
                  <div className="block-rater-item-albumName">{song.albumName}</div>
                  </div>
                  <div style={{background: mapSongScoreToUI(song.score).color}} className="block-rater-item-rating flex column">
                    <div className="block-rater-item-score">
                    { 
                      mapSongScoreToUI(song.score).score  
                    }
                    </div>
                    <div className="block-rater-item-score-descriptor">{mapSongScoreToUI(song.score).category}</div>
                  </div> 
                </li> )}
                </React.Fragment> 
}  


export const ScorecardPanel = ({musicState, musicDispatch}:Props) => {

  const navigate= (zoomLevel:MusicZoomLevel, artistId:string, albumId?:string)  => {

    switch(zoomLevel) {
      case MusicZoomLevel.ARTIST : {
        musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[artistId] }, zoomLevel: MusicZoomLevel.ALBUM })
        break;
      } 
      case MusicZoomLevel.ALBUM : 
      case MusicZoomLevel.SONG: { 
        if (albumId) {
        musicDispatch({ type: 'FILTER_CHANGE', filters: { artistIds:[artistId],albumIds:[albumId] }, zoomLevel: MusicZoomLevel.SONG  })
        }
        break;
      }
    }
  }
    const renderItems =  () => {
      const items = store.getItems() 
      const sortedItems = sortByScore(items)
      switch(store.zoomLevel) {
        case MusicZoomLevel.ARTIST: {
          return <ArtistBlockDetails onClick={navigate} items={sortedItems}/>
        } 
        case MusicZoomLevel.ALBUM: {
          return <AlbumBlockDetails onClick={navigate} items={sortedItems as AlbumUIItem[]}/>
        } 
        case MusicZoomLevel.SONG: {
          return <SongBlockDetails onClick={navigate} items={sortedItems as SongUIItem[]}/>
        } 
      }
    }

    const store = new MusicStore(musicState)
        return <Panel id="scorecard" className="relative" title="Scorecard">
            <ul>
              {renderItems()}
            </ul>
        </Panel>
}   