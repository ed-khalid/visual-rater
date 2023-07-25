import React from "react"
import { Artist } from "../../generated/graphql"
import './Panels.css'
import { Panel } from "./Panel"

interface Props {
    artist:Artist
    onSongCategoryClick:(artist:Artist, scoreFilter:{start:number, end:number}) => void
}

export const ArtistPanel = ({artist, onSongCategoryClick}:Props) => {



    return <Panel className='relative' id="artists-panel" title={artist.name}>
            <div>
                    <img className="artist-thumbnail" src={artist.thumbnail!} alt="" />
                    <div className="artist-metadata flex">
                        <div className="artist-metadata-row">
                           <div className="artist-metadata-label">Albums</div>
                           <div className="artist-metadata-value">{artist.metadata!.totalAlbums}</div>
                        </div>
                        <div className="artist-metadata-row">
                           <div className="artist-metadata-label">Songs</div>
                           <div className="artist-metadata-value">{artist.metadata!.totalSongs}</div>
                        </div>
                        <div className="artist-metadata-row" onClick={() => onSongCategoryClick(artist, { start:4.25 , end:5}) }>
                           <div className="artist-metadata-label">Classic</div>
                           <div className="artist-metadata-value">{artist.metadata!.songs.classic}</div>
                        </div>
                        <div className="artist-metadata-row" onClick={() => onSongCategoryClick(artist, { start: 4, end:4.2 })}>
                           <div className="artist-metadata-label">Great</div>
                           <div className="artist-metadata-value">{artist.metadata!.songs.great}</div>
                        </div>
                        <div className="artist-metadata-row" onClick={() => onSongCategoryClick(artist, { start: 3.5, end:3.95 })}>
                           <div className="artist-metadata-label">Good</div>
                           <div className="artist-metadata-value">{artist.metadata!.songs.good}</div>
                        </div>
                        <div className="artist-metadata-row" onClick={() => onSongCategoryClick(artist, { start: 3, end:3.45 })}>
                           <div className="artist-metadata-label">Mediocre</div>
                           <div className="artist-metadata-value">{artist.metadata!.songs.mediocre}</div>
                        </div>
                        <div className="artist-metadata-row" onClick={() => onSongCategoryClick(artist, { start: 2, end:2.95 })}>
                           <div className="artist-metadata-label">Bad</div>
                           <div className="artist-metadata-value">{artist.metadata!.songs.bad}</div>
                        </div>
                        <div className="artist-metadata-row" onClick={() => onSongCategoryClick(artist, { start: 0, end:1.95 })}>
                           <div className="artist-metadata-label">Terrible</div>
                           <div className="artist-metadata-value">{artist.metadata!.songs.terrible}</div>
                        </div>
                    </div>
            </div>
        </Panel>
} 