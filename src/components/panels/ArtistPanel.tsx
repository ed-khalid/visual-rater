import React from "react"
import { Artist } from "../../generated/graphql"
import './Panels.css'
import { Panel } from "./Panel"
import { SongScoreDescriptor } from "../../functions/scoreUI"
import { ScoreFilter } from "../../music/MusicState"

interface Props {
    artist:Artist
    onSongCategoryClick:(artist:Artist, scoreFilter:{start:number, end:number}) => void
}

export const ArtistPanel = ({artist, onSongCategoryClick}:Props) => {

   const onSongCategoryClickInternal = (category:SongScoreDescriptor) => {
      let scoreFilter:ScoreFilter = { start: 0, end: 100};  
      switch(category) {
         case 'CLASSIC': scoreFilter = { start: 95, end: 100 }; break;  
         case 'GREAT': scoreFilter = { start: 90, end: 95 }; break;  
         case 'VERY GOOD': scoreFilter = { start: 85, end: 90 }; break;  
         case 'GOOD': scoreFilter = { start: 80, end: 85 }; break;  
         case 'PLEASANT': scoreFilter = { start: 75, end: 80 }; break;  
         case 'DECENT': scoreFilter = { start: 70, end: 75 }; break;  
         case 'INTERESTING': scoreFilter = { start: 65, end: 70 }; break;  
         case 'OK': scoreFilter = { start: 60, end: 65 }; break;  
         case 'MEH': scoreFilter = { start: 55, end: 60 }; break;  
         case 'AVERAGE': scoreFilter = { start: 50, end: 55 }; break;  
         case 'BORING': scoreFilter = { start: 40, end: 50 }; break;  
         case 'POOR': scoreFilter = { start: 30, end: 40 }; break;  
         case 'BAD': scoreFilter = { start: 10, end: 30 }; break;  
         case 'OFFENSIVE': scoreFilter = { start: 0, end: 10 }; break;  
      }
      onSongCategoryClick(artist, scoreFilter)
   }  



    return <Panel className='relative' id="artists-panel" isCollapsible={true} title={artist.name}>
            <div className="grid"> 
               <img className="artist-thumbnail" src={artist.thumbnail!} alt="" />
               <div className="artist-score">{artist.score}</div>
               <div className="artist-albums">
                  <p>Albums</p>
                  <p>{artist.metadata?.totalAlbums}</p>
               </div>
               <div className="artist-songs">
                  <p>Songs</p>
                  <p>{artist.metadata?.totalSongs}</p>
                  <div className="grid artist-songs-categories">
                     <div className="artist-song-category-label" onClick={() => onSongCategoryClickInternal('CLASSIC')} >Classic</div>
                     <div className="artist-song-category-value" onClick={() => onSongCategoryClickInternal('CLASSIC')} >{artist.metadata!.songs.classic}</div>

                     <div className="artist-song-category-label" onClick={() => onSongCategoryClickInternal('GREAT')} >Great</div>
                     <div className="artist-song-category-value" onClick={() => onSongCategoryClickInternal('GREAT')} >{artist.metadata!.songs.great}</div>

                     <div className="artist-song-category-label">Very Good</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.verygood}</div>
                     <div className="artist-song-category-label">Good</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.good}</div>
                     <div className="artist-song-category-label">Pleasant</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.pleasant}</div>
                     <div className="artist-song-category-label">Decent</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.decent}</div>
                     <div className="artist-song-category-label">Interesting</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.interesting}</div>
                     <div className="artist-song-category-label">OK</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.ok}</div>
                     <div className="artist-song-category-label">Average</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.average}</div>
                     <div className="artist-song-category-label">Meh</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.meh}</div>
                     <div className="artist-song-category-label">Boring</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.boring}</div>
                     <div className="artist-song-category-label">Poor</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.poor}</div>
                     <div className="artist-song-category-label">Bad</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.bad}</div>
                     <div className="artist-song-category-label">Offensive</div>
                     <div className="artist-song-category-value">{artist.metadata!.songs.offensive}</div>
                  </div>
               </div>
               </div>
        </Panel>
} 