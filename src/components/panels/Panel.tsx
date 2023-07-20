import React, { ReactElement } from 'react'

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

    let classes = 'panel' 
    if (className) {
        classes = [classes, className].join(' ')
    }

    return <div className={classes} id={id} >
    <div className="panel-wrapper">
        {title && <div className="panel-header">
            <div className="panel-title">{title}</div> 
        </div>}
          <div className="panel-content">
            {children}
          </div>
    </div> 
    </div>
}

