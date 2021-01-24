import React from "react";
import './ReadOnlySingleRaterItem.css'
import { RatedItem } from "../../../models/RatedItem";

interface Props {
    item:RatedItem
    x:number
    y:number
} 

export const ReadOnlySingleRaterItem = ({item, x, y}:Props) =>  {
    return <g className="read-only-item" key={item.name}>
                          <g className="item"> 
                            <circle className="item-symbol" cx={x} cy={y} r="5"></circle>
                            <text className="item-score"  fontSize="12" fontSizeAdjust="2" x={x + 30} y={y} dy=".35em">{item.score.toFixed(2)}</text>
                            <text className="item-name" fontSize="12" fontSizeAdjust="2" x={x + 70} y={y} dy=".35em">{item.name}</text>
                          </g>
                      </g>
}