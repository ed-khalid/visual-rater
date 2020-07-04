import React, { DragEvent, SetStateAction, Dispatch, useState } from "react";
import './Rater.css';
import { Item } from "../models/Item";

interface Props {
    onAddItem: Dispatch<SetStateAction<Item[]>>;
    items: Item[];
}



export const Rater:React.FunctionComponent<Props> = (props) => {

    const  [ratedItems, updateRatedItems] = useState<Item[]>([]);

    const onDrop = (evt:DragEvent<HTMLDivElement>) => {
        const text = evt.dataTransfer.getData('text/plain');   
        const item = props.items.find(it => it.name === text);
        if (item === undefined) {
            throw new TypeError('Could not find a matching item');
        }
        updateRatedItems([...ratedItems, item]); 
        const newItems = props.items.filter(it => it.name !== text); 
        props.onAddItem(newItems);
    }  
    const onDragover = (evt:DragEvent<HTMLDivElement>) => {
        evt.preventDefault();
    }

    return (
      <div className="rater" onDrop={onDrop} onDragOver={onDragover}>
          <ul>
              {ratedItems.map(it => <li key={it.name}>{it.name}</li> )}
          </ul>
      </div>
    )
};  