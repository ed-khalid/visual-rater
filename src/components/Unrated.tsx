import React from "react";
import { Item } from "../models/item";




export const Unrated = ({items}:{items:Item[]}) => (
    <div>
        <h3>Hey There</h3> 
        <ol>
            {items.map((item:Item) => <li key={item.name}>item.name</li> )}
        </ol>
    </div>
); 