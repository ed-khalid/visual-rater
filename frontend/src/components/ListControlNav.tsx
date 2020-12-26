import React, { useState } from "react";
import  './ListControlNav.css';



export const ListControlNav =  ({setPageNumber, numberOfPages}:{setPageNumber:any, numberOfPages:number})  => {
  const [clickedNavButtonIndex, setClickedNavButtonIndex] = useState<number|null>(0);  
  const handleNavButtonClick = (i:number) => {
      setClickedNavButtonIndex(i);
      setPageNumber(i)
  } 

  const navButtons = []  
  if (numberOfPages > 1 ) {
    for (let i= 1 ;  i <= numberOfPages ; i++) {
        navButtons.push(<span key={i} onClick={() => handleNavButtonClick(i)} className={(clickedNavButtonIndex === i )? "selected" : ""}>O</span>)
    }
    return <div className="list-control-nav">
                {navButtons}
        </div>
  }
  return <div></div>
}

