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
    collapseDirection?:'up'|'down'|'left'|'right'
    onClose?: any
}

export const Panel = ({title, id, className, children, collapseDirection, isMoveable=false, isResizable=false, isCloseable=false, isCollapsible=false, onClose }:PanelProps) => {

    const [ isCollapsed, setIsCollapsed ] = useState<boolean>(false) 

    const handleCollapseButtonClick = () => {
        setIsCollapsed(isCollapsed => !isCollapsed)
    }  

    let classes = 'panel' 
    if (className) {
        classes = [classes, className].join(' ')
    }
    if (isMoveable) {
        classes += " moveable" 
    }
    if (isCollapsed) {
        classes += " collapsed"
    }

    return <div className={classes} id={id} >
        {title && <div  className={"panel-header" + (isCollapsed ? " collapsed": "") } >
            <div className="panel-control-icons">
                {isCloseable && <CloseButton onClose={onClose}/>  }
            </div>
            <div className="panel-title">{title}</div> 
        </div>}
          {<div className="panel-content ">
            <div className="panel-padding">
              {children}
            </div>
          </div>}
          {isCollapsible && collapseDirection === 'left' && <div className="collapse-button left">
            {!isCollapsed && <div onClick={() => handleCollapseButtonClick()} className="collapse-anchor"> {'<'}  </div> }
            {isCollapsed && <div onClick={() => handleCollapseButtonClick()} className="collapse-anchor"> {'>'}  </div> }
          </div> }
          {isCollapsible && collapseDirection === 'up' && <div className="collapse-button up">
            {!isCollapsed && <div onClick={() => handleCollapseButtonClick()} className="collapse-anchor"> {'^'}  </div> }
            {isCollapsed && <div onClick={() => handleCollapseButtonClick()} className="collapse-anchor"> {'v'}  </div> }
          </div> }
    </div>
}

