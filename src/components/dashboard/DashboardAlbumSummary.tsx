import React, { useEffect, useState } from "react";
import { Album, GetArtistsDocument, Song, SongInput, useDeleteAlbumMutation, useUpdateSongMutation } from "../../generated/graphql";
import './DashboardAlbumSummary.css'

interface Props {
    album:Album;
    artistName:string|undefined;
    onClose:any
}

// type SongCell =  Song & {  isNumberEdited:boolean, isNameEdited:boolean }   
// const mapSongToSongCell = (song:Song):SongCell => ({...song ,isNameEdited:false, isNumberEdited:false  })


export const DashboardAlbumSummary =  ({onClose, artistName, album }:Props) => {

    const [updateSong] = useUpdateSongMutation()
    const [albumRating, setAlbumRating] = useState<number>(0);
    const [songs, setSongs] = useState<Song[]>(album.songs)    
    const [deleteAlbum, ] = useDeleteAlbumMutation()
    const [songUnderEdit, setSongUnderEdit] = useState<{id:string|undefined, name:string, number:string}>({ id:undefined, name: '', number:'' }) 


    useEffect(() => {
        setSongs(album.songs)
    }, [album])

    useEffect(() => {
        calculateAlbumRating(songs)
    }, [songs])

    const calculateAlbumRating =  (songs:Song[]) => {
        const songsWithScores = songs.filter(it=>it.score) 
        const scores = songsWithScores.filter(it => it.score).reduce((curr,it) => curr + it.score!, 0)
        setAlbumRating(scores/songsWithScores.length)
    }


    const sort = (songs:Song[]) => {
        const sortedSongs = [...songs] 
        const sort = (a:any, b:any, prop:string):number => {
            let retv:number = 2;  
            if (a[prop] === b[prop]) {
                retv = 0;
            }
            else if (a[prop] > b[prop]) {
                retv = 1
            } else {
                retv =  -1  
            }
            return retv
        } 
        const sortByNumber = (a:Song,b:Song) => sort(a,b,"number") 
        sortedSongs.sort(sortByNumber)
        return sortedSongs
    }
    const updateScore = (score:number, _song:Song) => {
        const song:SongInput = {
            id: _song.id,
            score 
        }
        updateSong({ variables: { song }})
    }
    const onAlbumDelete = (album:Album) => {
        deleteAlbum({variables: { albumId: album.id}, refetchQueries: [{query: GetArtistsDocument}]})
        onClose()
    }

    const onEdit = (field:string, val:string) => {
        if (field === 'number') {
          setSongUnderEdit({...songUnderEdit, number:val})
        }
        if (field === 'name') {
          setSongUnderEdit({...songUnderEdit, name:val})
        }
    }

    const saveSong =  () => {
          updateSong({variables: { song: { id:songUnderEdit.id! , name: songUnderEdit.name } }})
          setSongUnderEdit({ id: undefined, name: '', number: ''})
    }


    return <div className="dashboard-album-summary flex-column">
        <div onClick={onClose} className="dashboard-album-close-button">x</div>
        <div className="dashboard-album-header flex">
          <div className="dashboard-album-thumbnail">
              <img src={album.thumbnail || undefined} alt={album.name}/>
          </div>
          <div className="dashboard-album-actions">
              <button onClick={() => onAlbumDelete(album)}>DELETE</button>
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
        <div id="table-wrapper">
        <table>
            <thead>
                <tr>
                    <td className="header-cell action-cell">actions</td> 
                    <td className="header-cell number-cell">#</td>
                    <td className="header-cell name-cell">Name</td>
                    <td className="header-cell score-cell">Score</td>
                </tr>

            </thead>
            <tbody>
                {sort(songs).map(song =><tr key={song.id}>
                    <td className="action-cell">
                        {!(songUnderEdit.id === song.id) && <div onClick={() => setSongUnderEdit({ id: song.id, name: song.name,number:song.number.toString()}) }>
                          edit
                        </div>}
                        {songUnderEdit.id === song.id && <div onClick={() => saveSong()}> save</div>}
                    </td>
                    <td className="number-cell">
                        <div className="flex-column">
                            {!(songUnderEdit.id === song.id) && 
                              <div className="content">
                                    {song.number}</div>
                            }
                            {(songUnderEdit.id === song.id) && 
                            <div>
                              <input className="song-number" value={songUnderEdit.number} onChange={(e) => onEdit('number', e.target.value) } ></input>
                            </div>
                            }
                        </div>
                    </td>
                    <td className="name-cell">
                        <div className="flex-column">
                            {!(songUnderEdit.id === song.id) && 
                              <div className="content">
                                    {song.name}</div>
                            }
                            {(songUnderEdit.id === song.id) && 
                            <div>
                              <input className="song-name" value={songUnderEdit.name} onChange={(e) => onEdit('name', e.target.value) } ></input>
                            </div>
                            }
                        </div>
                    </td>
                    <td className="score-cell">
                        <div>
                          <input type="text" value={song.score || 'N/A' } onChange={(e)=> updateScore(Number(e.target.value), song)  }/>
                          <div id="score-shortcut-wrapper" className="flex">
                              {/* <div className="score-shortcut plus-minus" onClick={() => updateScore((song.score||0) - 0.25, song) }>-</div>
                              {[1,2,3,4,5].map(it => <div className="score-shortcut" key={"score-"+it} onClick={() => updateScore(it, song)}>{it}</div> )}
                              <div className="score-shortcut plus-minus" onClick={() => updateScore((song.score||0) + 0.25, song) }>+</div> */}
                              <div className="score-shortcut plus-minus" onClick={() => updateScore(-1, song) }>n/a</div>
                          </div>
                        </div>
                    </td>
                </tr>)}
            </tbody>
        </table>
        </div>
        <div id="album-rating" className="flex">
            <div id="album-rating-title" className="font-title">Score</div>
            <div id ="album-score">{albumRating.toFixed(2)}</div>
        </div>
    </div>
}