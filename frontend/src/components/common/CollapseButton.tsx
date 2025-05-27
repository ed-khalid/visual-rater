import React from "react"

interface Props {
    isCollapsed:boolean
    setIsCollapsed:(val:boolean) => void 
    theme?: "dark"|"light" 
}

export const CollapseButton = ({isCollapsed, setIsCollapsed, theme: style = "light"}:Props) => {
                return <svg onClick={() => setIsCollapsed(!isCollapsed)} cursor={"pointer"} className={"collapse-button " + (isCollapsed ? "collapsed": "" ) } width="16px" height="16px">
                        <line stroke={(style === "dark") ? "black": "white"} x1="0" y1="1" x2="8" y2="15" />
                        <line stroke={(style === "dark") ? "black": "white"} x1="14" y1="1" x2="8" y2="15" />
                </svg> 
}  