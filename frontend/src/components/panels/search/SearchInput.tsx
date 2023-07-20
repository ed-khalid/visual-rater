import React, { useState } from "react";
import spotifyIcon from './spotify_icon.svg'


interface Props {
    onClick : (artistName:string) => void 
    value:string
}


export const SearchInput = ({value, onClick}:Props) => {
   const [inputValue, setInputValue] = useState<string>(value)

   const onChange = (val:string) => {
      setInputValue(val)
   }  

   return <div id="search-field">
    <label id="search-field-label">Spotify Search</label>
    <img id="search-field-icon" src={spotifyIcon} alt={''}/>
    <input value={inputValue} onChange={(e) => onChange(e.target.value)} type="text" onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onClick(inputValue)
                    }
                    return
                } 
                }></input>
   </div>
}