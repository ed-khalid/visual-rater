import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Album, Song, SongInput, useUpdateSongMutation } from "../../generated/graphql";
import { faEye } from '@fortawesome/free-solid-svg-icons';
import './DashboardAlbumSummary.css'

interface Props {
    album:Album;
    artistName:string|undefined;
    openAlbumInSearch:() => void;
}


export const DashboardAlbumSummary =  ({artistName, album, openAlbumInSearch }:Props) => {

    enum SORT_TYPE { NUMBER, NAME, SCORE}    
    enum SORT_DIRECTION {  ASC, DESC }    

    const [updateSong] = useUpdateSongMutation()
    const [albumRating, setAlbumRating] = useState<number>(0);
    const [songs, setSongs] = useState<Song[]>(album.songs)    
    const [sortDirections, setSortDirections] = useState<{[key:string]:SORT_DIRECTION}>({
        "name": SORT_DIRECTION.ASC,
        "number": SORT_DIRECTION.ASC,
        "score": SORT_DIRECTION.ASC,
    })    

    useEffect(() => {
        setSongs(album.songs)
    }, [album])

    useEffect(() => {
        calculateAlbumRating(songs)
    }, [songs])

    const calculateAlbumRating =  (songs:Song[]) => {
        const scores = songs.reduce((curr,it) => curr + it.score, 0)
        setAlbumRating(scores/songs.length)
    }



    const sortBy = (sortType:SORT_TYPE ) => {

        const sortedSongs = [...songs] 
        const sortDir = sortDirections[sortType.toString().toLowerCase()]
        sortDirections[sortType.toString().toLowerCase()] = (sortDir === SORT_DIRECTION.ASC) ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC   
        setSortDirections({...sortDirections})
        const sort = (a:any, b:any, prop:string):number => {
            let retv:number = 2;  
            if (a[prop] === b[prop]) {
                retv = 0;
            }
            else if (a[prop] > b[prop]) {
                retv = (sortDir === SORT_DIRECTION.ASC) ? 1: -1  
            } else {
                retv = (sortDir === SORT_DIRECTION.ASC) ? -1: 1  
            }
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
    const updateScore = (score:number, _song:Song) => {
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

    return <div className="dashboard-album-summary flex-column">
        <div className="dashboard-album-header flex">
          <div className="dashboard-album-thumbnail">
              <img src={album.thumbnail || undefined} alt={album.name}/>
          </div>
          {!album.isComplete && <div id="dashboard-search">
              <FontAwesomeIcon onClick={openAlbumInSearch} icon={faEye} ></FontAwesomeIcon> 
          </div>}
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
                        <div>
                          <input type="text" value={song.score.toFixed(2)} onChange={(e)=> updateScore(Number(e.target.value), song)  }/>
                          <div id="score-shortcut-wrapper" className="flex">
                              <div className="score-shortcut plus-minus" onClick={() => updateScore(song.score - 0.25, song) }>-</div>
                              {[1,2,3,4,5].map(it => <div className="score-shortcut" key={"score-"+it} onClick={() => updateScore(it, song)}>{it}</div> )}
                              <div className="score-shortcut plus-minus" onClick={() => updateScore(song.score + 0.25, song) }>+</div>
                          </div>
                        </div>
                    </td>
                </tr>)}
            </tbody>
        </table>
        <div id="album-rating" className="flex">
            <div id="album-rating-title" className="font-title">Score</div>
            <div id ="album-score">{albumRating}</div>
        </div>
    </div>
}