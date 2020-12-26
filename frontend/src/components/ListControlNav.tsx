import React, { useState } from "react";
import  './ListControlNav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faDotCircle } from '@fortawesome/free-solid-svg-icons'


export const ListControlNav =  ({setPageNumber, numberOfPages}:{setPageNumber:any, numberOfPages:number})  => {
  const [clickedNavButtonIndex, setClickedNavButtonIndex] = useState<number|null>(1);  
  const handleNavButtonClick = (i:number) => {
      setClickedNavButtonIndex(i);
      setPageNumber(i)
  } 

  const navButtons = []  
  if (numberOfPages > 1 ) {
    for (let i= 1 ;  i <= numberOfPages ; i++) {
        navButtons.push(<FontAwesomeIcon size="xs" icon={(clickedNavButtonIndex === i )?faDotCircle:faCircle} key={i} onClick={() => handleNavButtonClick(i)} className={(clickedNavButtonIndex === i )? "selected" : ""}/>)
    }
    return <div className="list-control-nav">
                {navButtons}
           </div>
  }
  return <div></div>
}

