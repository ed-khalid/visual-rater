import { Item } from "../models/Item";
import React from "react";


interface Props {
    items:Item[];
}

export const Unrated:React.FunctionComponent<Props> = ({items}:{items:Item[]}) => (
    <ul>
        {items.map(item => <li key={item.name}>{item.name}</li> )}
    </ul>
);