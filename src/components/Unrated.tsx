import { Item } from "../models/Item";
import React, { DragEvent } from "react";
import './Unrated.css';


interface Props {
    items:Item[];
}

export const Unrated:React.FunctionComponent<Props> = ({items}:{items:Item[]}) => {
    const dragStart = (evt:DragEvent<HTMLDivElement>) => {
        let element = evt.target as HTMLDivElement; 
            requestAnimationFrame( () => {
                if (element != null) {
                  element.classList.add('hide');
                }
            })
    }
    const dragEnd =(e:DragEvent<HTMLDivElement>) => {
        let element =  e.target as HTMLDivElement;
        if (element != null) {
          element.classList.remove('hide');
        }
    }
    return(
        <ol>
            {items.map(item => <li key={item.name}><div draggable="true" onDragStart={dragStart} onDragEnd={dragEnd}>{item.name}</div></li> )}
        </ol>
    );
};

