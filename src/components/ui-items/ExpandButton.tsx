
import React from "react"

interface Props {
    isExpanded:boolean
    setIsExpanded:(val:boolean) => void 
    theme?: "dark"|"light" 
}

export const ExpandButton = ({isExpanded, setIsExpanded, theme: style = "light"}:Props) => {
                return <svg viewBox="-5 -5 20 30" onClick={() => setIsExpanded(!isExpanded)} cursor={"pointer"} className={"expand-button " + (isExpanded ? "expanded": "" ) } width="16px" height="16px">
                        <line stroke={(style === "dark") ? "black": "white"} x1="0" y1="1" x2="8" y2="15" />
                        <line stroke={(style === "dark") ? "black": "white"} x1="14" y1="1" x2="8" y2="15" />
                </svg> 
}  