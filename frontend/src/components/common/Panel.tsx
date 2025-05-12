import React, { ReactElement, useState } from 'react'
import { CollapseButton } from '../ui-items/CollapseButton'
import { CloseButton } from '../ui-items/CloseButton'

interface PanelProps {
    title?:string
    className?:string
    id?:string
    children:ReactElement
    isMoveable?:boolean
    isResizable?:boolean
    isCloseable?:boolean
    isCollapsible?:boolean
    onClose?: any
}

export const Panel = ({title, id, className, children, isMoveable=false, isResizable=false, isCloseable=false, isCollapsible=false, onClose }:PanelProps) => {

    const [ isCollapsed, setIsCollapsed ] = useState<boolean>(false) 

    const handleCollapseButtonClick = (_:boolean) => {
        setIsCollapsed(isCollapsed => !isCollapsed)
    }  

    let classes = 'panel' 
    if (className) {
        classes = [classes, className].join(' ')
    }
    if (isMoveable) {
        classes += " moveable" 
    }

    return <div className={classes} id={id} >
    <div className="panel-wrapper">
        {title && <div className="panel-header">
            <div className="panel-control-icons">
                {isCollapsible && <CollapseButton isCollapsed={isCollapsed} setIsCollapsed={handleCollapseButtonClick} />}
                {isCloseable && <CloseButton onClose={onClose}/>  }
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

