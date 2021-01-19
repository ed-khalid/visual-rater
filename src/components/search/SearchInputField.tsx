import React from "react";
import './SearchInputField.css'


interface Props {
    onInputFieldChange : (artistName:string) => void 
    value:string
}


export const SearchInputField = ({value, onInputFieldChange}:Props) => {
    return <div id="search-input" className="wrapper">
            <input value={value} type="text" onChange={(e) => onInputFieldChange(e.target.value)}></input>
    </div>
}