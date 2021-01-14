import React, { useEffect, useState } from "react";
import { Album, Song, SongInput, useUpdateSongMutation } from "../../generated/graphql";
import './DashboardAlbumSummary.css'

interface Props {
    album:Album;
    artistName:string|undefined;
}


export const DashboardAlbumSummary =  ({artistName, album}:Props) => {

    enum SORT_TYPE { NUMBER, NAME, SCORE}    
    enum SORT_DIRECTION {  ASC, DESC }    

    const [updateSong] = useUpdateSongMutation()

    useEffect(() => {
        setSongs(album.songs)
    }, [album])

    const [songs, setSongs] = useState<Song[]>(album.songs)    
    const [sortDirections, setSortDirections] = useState<{[key:string]:SORT_DIRECTION}>({
        "name": SORT_DIRECTION.ASC,
        "number": SORT_DIRECTION.ASC,
        "score": SORT_DIRECTION.ASC,
    })    

    const sortBy = (sortType:SORT_TYPE ) => {

        const sortedSongs = [...songs] 
        const sort = (a:any, b:any, prop:string):number => {
            const sortDir = sortDirections[prop]
            let retv:number = 2;  
            if (a[prop] === b[prop]) {
                retv = 0;
            }
            else if (a[prop] > b[prop]) {
                retv = (sortDir === SORT_DIRECTION.ASC) ? 1: -1  
            } else {
                retv = (sortDir === SORT_DIRECTION.ASC) ? -1: 1  
            }
            sortDirections[prop] = (sortDir === SORT_DIRECTION.ASC) ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC   
            setSortDirections({...sortDirections})
            return retv
        } 


        const sortByNumber = (a:Song,b:Song) => sort(a,b,"number") 
        const sortByScore  = (a:Song,b:Song) => sort(a,b,"score") 
        const sortByName   = (a:Song,b:Song) => sort(a,b,"name") 
        switch(sortType) {
            case SORT_TYPE.NAME : sortedSongs.sort(sortByName); break; 
            case SORT_TYPE.NUMBER : sortedSongs.sort(sortByNumber); break; 
            case SORT_TYPE.SCORE : sortedSongs.sort(sortByScore); break; 
        }
        setSongs(sortedSongs)
    }
    const updateScore = (newValue:string, _song:Song) => {
        const score = Number(newValue)
        if (Number.isNaN(score)) {
            console.log('not a number')
            return;
        }
        
        const song:SongInput = {
            score 
            ,id: _song.id
        }
        updateSong({ variables: { song }})
    }

    return <div className="dashboard-album-summary">
        <div className="dashboard-album-header flex">
          <div className="dashboard-album-thumbnail">
              <img src={album.thumbnail || undefined} alt={album.name}/>
          </div>
          <div className="dashboard-album-title-wrapper">
              <div>
                  {artistName}
              </div>
              <div className="dashboard-album-title">
                 {album.name}
              </div>
              <div className="dashboard-album-year">
                 {album.year}
              </div>
          </div>
        </div>
        <table>
            <thead>
                <tr>
                    <td onClick={() => sortBy(SORT_TYPE.NUMBER) }  className="header-cell number-cell">#</td>
                    <td onClick={() => sortBy(SORT_TYPE.NAME) } className="header-cell name-cell">Name</td>
                    <td onClick={() => sortBy(SORT_TYPE.SCORE)} className="header-cell score-cell">Score</td>
                </tr>

            </thead>
            <tbody>
                {songs.map(song =><tr key={song.id}>
                    <td className="number-cell">{song.number}</td>
                    <td className="name-cell">{song.name}</td>
                    <td className="score-cell">
                        <div className="flex">
                          <input type="text" value={song.score.toFixed(2)} onChange={(e)=> updateScore(e.target.value, song)  }/>
                        </div>
                    </td>
                </tr>)}
            </tbody>
        </table>
    </div>
}