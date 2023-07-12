import React, { ReactElement } from 'react'

interface PanelProps {
    title:string
    className?:string
    id:string
    children:ReactElement
    isDraggable?:boolean
    isResizable?:boolean
    isCloseable?:boolean
    isCollapsible?:boolean
}

interface PanelContentProps {
    children:ReactElement
}
export const Panel = ({title, id, className, children}:PanelProps) => {

    let classes = 'panel' 
    if (className) {
        classes = [classes, className].join(' ')
    }

    return <div className={classes} id={id} >
    <div className="panel-wrapper">
          <div className="panel-header-wrapper">
            <div className="panel-header">
              <div className="panel-title">{title}</div> 
            </div>
          </div>
          {children}
    </div> 
    </div>
}


export const PanelContent = ({children}:PanelContentProps) => {
    return <div className="panel-content">
        {children}
        </div>
}