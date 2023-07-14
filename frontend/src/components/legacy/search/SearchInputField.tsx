import React, { useState } from "react";
import './SearchInputField.css'


interface Props {
    onClick : (artistName:string) => void 
    value:string
}


export const SearchInputField = ({value, onClick}:Props) => {
   const [inputValue, setInputValue] = useState<string>(value)

   const onChange = (val:string) => {
      setInputValue(val)
   }  

   return <div id="search-input" className="wrapper">
            <input value={inputValue} onChange={(e) => onChange(e.target.value)} type="text" onKeyDown={(e) => {
                if (e.key === "Enter") {
                    onClick(inputValue)
                }
                return
            } 
            }></input>
    </div>
}