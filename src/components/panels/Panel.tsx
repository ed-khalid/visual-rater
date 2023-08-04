import React, { ReactElement, useState } from 'react'
import { CollapseButton } from '../ui-items/CollapseButton'
import { useDraggable } from './behavior/Draggable'

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

export const Panel = ({title, id, className, children, isMoveable=false, isResizable=false, isCloseable=true, isCollapsible=false }:PanelProps) => {

    const [ isCollapsed, setIsCollapsed ] = useState<boolean>(false) 
    const [ref] =  useDraggable()

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

    return <div  ref={(isMoveable)? ref: null} className={classes} id={id} >
    <div className="panel-wrapper">
        {title && <div className="panel-header">
            <div className="panel-control-icons">
                {isCollapsible && <CollapseButton isCollapsed={isCollapsed} setIsCollapsed={handleCollapseButtonClick} />}
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

