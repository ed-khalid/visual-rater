import React, { ReactElement, useRef, useState } from 'react'

interface PanelProps {
    title?:string
    className?:string
    id?:string
    children:ReactElement
    isMoveable?:boolean
    isResizable?:boolean
    isCloseable?:boolean
    isCollapsible?:boolean
}

export const Panel = ({title, id, className, children, isMoveable=true, isResizable=false, isCloseable=true, isCollapsible=false }:PanelProps) => {

    const [ isCollapsed, setIsCollapsed ] = useState<boolean>(false) 
    const collapseArrow = useRef<SVGSVGElement>(null)  

    const collapse = () => {

    }  

    let classes = 'panel' 
    if (className) {
        classes = [classes, className].join(' ')
    }

    return <div className={classes} id={id} >
    <div className="panel-wrapper">
        {title && <div className="panel-header">
            <div className="panel-control-icons">
                {isCollapsible && <svg ref={collapseArrow} onClick={() => setIsCollapsed(state => !state) } cursor={"pointer"} className={"panel-button-collapse " + (isCollapsed ? "collapsed": "" ) } width="16px" height="16px">
                        <line stroke="white" x1="0" y1="1" x2="8" y2="15" />
                        <line stroke="white" x1="14" y1="1" x2="8" y2="15" />
                    
                </svg> }
            </div>
            <div className="panel-title">{title}</div> 
        </div>}
          {<div className={ "panel-content " + (isCollapsed ? "collapsed" : "")}>
            <div className="panel-padding">
              {children}
            </div>
          </div>}
    </div> 
    </div>
}

