import { ReactElement, useEffect, useState } from 'react'
import { CloseButton } from './CloseButton'
import { CollapseButton } from './CollapseButton'

interface PanelProps {
    title?:string
    className?:string
    id?:string
    customTitle?:ReactElement
    children:ReactElement
    isMoveable?:boolean
    isResizable?:boolean
    isCloseable?:boolean
    isCollapsible?:boolean
    collapseDirection?:'up'|'down'|'left'|'right'
    onClose?: any
    onCollapse?:any
}

export const Panel = ({title, id, className, children, customTitle, isMoveable=false, isResizable=false, isCloseable=false, isCollapsible=false, onClose, onCollapse }:PanelProps) => {

    const [ isCollapsed, setIsCollapsed ] = useState<boolean>(false) 

    useEffect(() => {
      if (onCollapse) {
        onCollapse(isCollapsed)
      }
    }, [isCollapsed])

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
        {customTitle}
        {!customTitle && title && <div  className={"panel-header" + (isCollapsed ? " collapsed": "") } >
            <div className="panel-title">{title}</div> 
            <div className="panel-control-icons">
                {isCloseable && <CloseButton onClose={onClose}/>  }
                {isCollapsible && <CollapseButton isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />} 
            </div>
        </div>}
          {<div className="panel-content ">
            <div className="panel-padding">
              {children}
            </div>
          </div>}
    </div>
}

