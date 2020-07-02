import React, { DragEvent } from "react";
import './Rater.css';

interface Props {

}



export const Rater:React.FunctionComponent<Props> = () => {

    const onDrop = (evt:DragEvent<HTMLDivElement>) => {
        console.log(evt.nativeEvent);
    }  
    const onDragover = (evt:DragEvent<HTMLDivElement>) => {
        evt.preventDefault();
    }

    return (
      <div className="rater" onDrop={onDrop} onDragOver={onDragover}></div>
    )
};  