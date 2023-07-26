import React from "react"
import { Panel } from "./Panel"
import { MusicScope, MusicState } from "../../music/MusicState"
import { MusicStore } from "../../music/MusicStore"
import { sortByScore } from "../../functions/sort"
import { mapArtistScoreToUI, mapSongScoreToUI } from "../../functions/scoreUI"
import { AlbumUIItem, MusicUIItem, SongUIItem } from "../../models/domain/ItemTypes"

interface Props {
    musicState:MusicState
}


interface ArtistBlockProps {
  items:MusicUIItem[]
}
interface AlbumBlockProps {
  items:AlbumUIItem[]
}
interface SongBlockProps {
  items:SongUIItem[]
}
const ArtistBlockDetails = ({items}:ArtistBlockProps) => {
                return <React.Fragment>
                {items.map(artist => <li className="flex" key={'block-rater-item-' + artist.id}>
                  <img src={artist.thumbnail} alt='?' className="block-rater-item-thumbnail"/> 
                  <div className="block-rater-item-info">
                    <div className="block-rater-item-name">{artist.name} </div>
                  </div>
                  <div style={{background: mapArtistScoreToUI(artist.score).color}} className="block-rater-item-rating flex column">
                    <div className="block-rater-item-score">
                    { 
                      mapArtistScoreToUI(artist.score).description  
                    }
                    </div>
                    <div className="block-rater-item-score-descriptor">{mapArtistScoreToUI(artist.score).score}</div>
                  </div> 
                </li> )}
                </React.Fragment> 
}  
const AlbumBlockDetails = ({items}:AlbumBlockProps) => {
                return <React.Fragment>
                {items.map(album => <li className="flex" key={'block-rater-item-' + album.id}>
                  <img src={album.thumbnail} alt='?' className="block-rater-item-thumbnail"/> 
                  <div className="block-rater-item-info">
                    <div className="block-rater-item-name">{album.name} </div>
                    <div className="block-rater-item-artistName">{album.artistName}</div>
                  <div className="block-rater-item-year">{album.year}</div>
                  </div>
                  <div style={{background: mapArtistScoreToUI(album.score).color}} className="block-rater-item-rating flex column">
                    <div className="block-rater-item-score">
                    { 
                      mapArtistScoreToUI(album.score).description  
                    }
                    </div>
                    <div className="block-rater-item-score-descriptor">{mapArtistScoreToUI(album.score).score}</div>
                  </div> 
                </li> )}
                </React.Fragment> 
}  

const SongBlockDetails = ({items}:SongBlockProps) => {
                return <React.Fragment>
                {items.map(song => <li className="flex" key={'block-rater-item-' + song.id}>
                  <img src={song.thumbnail} alt='?' className="block-rater-item-thumbnail"/> 
                  <div className="block-rater-item-info">
                    <div className="block-rater-item-songName">{song.name} </div>
                    <div className="block-rater-item-artistName">{song.artistName}</div>
                  <div className="block-rater-item-albumName">{song.albumName}</div>
                  </div>
                  <div style={{background: mapSongScoreToUI(song.score).color}} className="block-rater-item-rating flex column">
                    <div className="block-rater-item-score">
                    { 
                      mapSongScoreToUI(song.score).score  
                    }
                    </div>
                    <div className="block-rater-item-score-descriptor">{mapSongScoreToUI(song.score).description}</div>
                  </div> 
                </li> )}
                </React.Fragment> 
}  


// music scope is SONG
export const DetailsPanel = ({musicState}:Props) => {


    const renderItems =  () => {
      const items = store.getItems() 
      const sortedItems = sortByScore(items)
      switch(store.getScope()) {
        case MusicScope.ARTIST: {
          return <ArtistBlockDetails items={sortedItems}/>
        } 
        case MusicScope.ALBUM: {
          return <AlbumBlockDetails items={sortedItems as AlbumUIItem[]}/>
        } 
        case MusicScope.SONG: {
          return <SongBlockDetails items={sortedItems as SongUIItem[]}/>
        } 
      }
    }

    const store = new MusicStore(musicState)
        return <Panel id="block-rater" className="relative" title="Block Rater">
            <ul>
              {renderItems()}
            </ul>
        </Panel>
}   