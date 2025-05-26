import { useEffect, useRef, useState } from "react";
import { mapArtistScoreToUI } from "../../functions/scoreUI";
import { Song } from "../../generated/graphql";
import { UnratedAlbum } from "../../pages/UnratedPage";
import { SimpleRater } from "../raters/simple/SimpleRater";
import { KeyboardEvent } from "react";
import './UnratedAlbumOverview.css'
import { FatSong } from "../../models/RaterModels";
import { mapSongToFatSong } from "../../functions/mapper";

interface Props {
    album: UnratedAlbum
}

export const UnratedAlbumOverview = ({album}:Props) => {

    const [unratedAlbum, setUnratedAlbum] = useState<UnratedAlbum>({...album}) 
    const [underEditId, setUnderEditId] = useState<number|undefined>(undefined)  
    const [inputValue, setInputValue] = useState<string>('') 
    const inputRef = useRef<HTMLInputElement>(null) 

    const [songs, setSongs] = useState<Song[]>([]) 
    const [simpleRaterItems, setSimpleRaterItems] = useState<FatSong[]>([])  

    useEffect(() => {
        const albumSongs = [...album.songs].sort((a, b) => (a.discNumber) - (b.discNumber))  
        const songsWithoutDiscs =  albumSongs.map((it, index) => {
            return { ...it, number: index+1  }
        }) 
        setSongs([...songsWithoutDiscs])
        setSimpleRaterItems(songsWithoutDiscs.map( it => mapSongToFatSong(it, album, album.artist)))
    }, [album])

    useEffect(() => {
        const scoredSongs = songs.filter(it => it.score !== null && it.score !== undefined).map(it => it.score)
        const totalScore = scoredSongs.reduce<number>((acc, it) => acc+it!! , 0)  
        const score = (totalScore/scoredSongs.length)
        setUnratedAlbum({ ...unratedAlbum, score   })
    }, [songs])
    
    useEffect(() => {
        if (underEditId === undefined) return 
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [underEditId])

    const onEdit = (id:number) => {
        setUnderEditId(id)
        if (id == -1) {
            setInputValue(unratedAlbum.name)
        } else {
            setInputValue(songs[id].name)
        }
    }
    const onSaveInput = () => {
        if (underEditId === undefined) return
        // album name
        if (underEditId === -1) {
            setUnratedAlbum((prev) => ({...prev, name: inputValue }))
        } else {
            setSongs(prev => {
                prev[underEditId] = {...prev[underEditId], name: inputValue }  
                return [...prev]
            })
        }
        setUnderEditId(undefined)
        setInputValue('')
    }
    const onUpdateInput = (value:string) => {    
        setInputValue(value)
    }
    const onInputKeyDown = (event:KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            onSaveInput()
        }
    }
    const onCancel = () => {
        setUnderEditId(undefined)
    }

    const onRaterUpdate = (updatedFatSong:FatSong) => {
        const song = songs.find(it => it.id === updatedFatSong.song.id) 
        if (!song) throw "unrated song not found!"
        const newSong = {...song, score: updatedFatSong.song.score}
        const songIndex = songs.indexOf(song)   
        songs[songIndex] = newSong 
        simpleRaterItems[songIndex] = { ...updatedFatSong}
        setSongs([...songs])
        setSimpleRaterItems([...simpleRaterItems]) 
    } 


    const scoreUI = mapArtistScoreToUI(unratedAlbum.score)  

    return <div className="overview-panel">
        <div className="title">
            <div className="title-text">
              {album.artist.name} - {(underEditId === -1)  ? <input className="title-input" ref={inputRef} type="text" value={inputValue} onKeyDown={onInputKeyDown} onBlur={onSaveInput} onChange={(e) => onUpdateInput(e.target.value) } /> : <div onClick={() => onEdit(-1) } className="editable">{unratedAlbum.name}</div>}  
            </div>
        </div>
        <div className="thumbnail">
            <img src = {album.thumbnail || ''} alt="cover" />
       </div> 
       <div style={{backgroundColor: scoreUI.color }} className="tier">
            <div className="tier-letter">
                {scoreUI.category}
            </div>
            <div className="tier-score">
                {scoreUI.score}
            </div>
       </div>
       <div className="tracks">
        <div className="track-row header">
            <div className="track-number">#</div>
            <div className="track-name">NAME</div>
            <div className="track-action"></div>
            <div className="track-score">SCORE</div>
        </div>
        <div className="tracklist">
         {songs.map((song, index) => 
            <div className="track-row">
            <div className="track-number">
                {song.number}
            </div>
            <div className="track-action">
                {(underEditId===index) && <button onClick={()=> onCancel() }>x</button>}
                {(underEditId!==index) && <button onClick={()=> onEdit(index) }>edit</button>}
            </div>
            <div className="track-name">
                {(underEditId === index) ? <input className="track-input" ref={inputRef} type="text" value={inputValue} onKeyDown={onInputKeyDown} onChange={(e) => onUpdateInput(e.target.value) } /> : <div className="editable">{song.name}</div>}  
            </div>
            <div className="track-score">
                {song.score || 'Unrated'}
            </div>
            </div> 
            )}
        </div>
       </div>
       <div className="rater">
        <SimpleRater onUpdate={onRaterUpdate} items={simpleRaterItems} />
       </div>
    </div>
}