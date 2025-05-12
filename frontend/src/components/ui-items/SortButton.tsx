

import React from "react"

export type SortDirection = "ascending" | "descending"

interface Props {
    sortDirection:SortDirection
    flipDirection:() => void 
    theme?: "dark"|"light" 
}

export const SortButton = ({sortDirection, flipDirection, theme: style = "light"}:Props) => {
                return <svg viewBox="-5 -5 20 30" onClick={() => flipDirection()} cursor={"pointer"} className={"sort-button " + sortDirection } width="16px" height="16px">
                        <line stroke={(style === "dark") ? "black": "white"} x1="0" y1="1" x2="8" y2="15" />
                        <line stroke={(style === "dark") ? "black": "white"} x1="14" y1="1" x2="8" y2="15" />
                </svg> 
}  