
import React from "react"

interface Props {
    onClose:any
    theme?: "dark"|"light" 
}

export const CloseButton = ({onClose, theme: style = "light"}:Props) => {
                return <svg className="button right" onClick={onClose} cursor={"pointer"} width="16px" height="16px">
                        <line stroke={(style === "dark") ? "black": "white"} x1="5" y1="6" x2="11" y2="13" />
                        <line stroke={(style === "dark") ? "black": "white"} x1="11" y1="6" x2="5" y2="13" />
                </svg> 
}  