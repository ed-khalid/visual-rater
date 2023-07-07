import React from "react";
import { Scaler } from "../../functions/scale";
import './MultiRaterItem.css'
import { RATER_BOTTOM } from "../../App";
import { RaterOrientation, RaterTreeInfo } from "./Rater";
import { SingleRaterItem } from "./SingleRaterItem";
import { Position } from "../../models/Position";

interface MultiRaterItemProps {
    tree:RaterTreeInfo
    orientation:RaterOrientation
    scaler:Scaler
    onDragEnd:any
} 

export const MultiRaterItem = ({tree, onDragEnd, orientation, scaler }:MultiRaterItemProps) =>  {

       return <g className="groupedItems">
            <line x1={tree.center.x} y1={tree.center.y} x2={tree.mainline.x} y2={tree.mainline.y} stroke="black"></line> 
            {tree.items.map((treeElement,i) => 
            <g>
            <line key={"coord"+i} x1={tree.center.x} y1={tree.center.y} x2={treeElement.coord.x + tree.center.x} y2={tree.center.y- treeElement.coord.y} stroke="black"></line>
            <SingleRaterItem
              key={'multiline-tree-item-' + treeElement.item.id + "-" + i }
              item={treeElement.item}
              orientation={orientation}
              raterBottom={RATER_BOTTOM}
              x={treeElement.coord.x+ tree.center.x}
              y={tree.center.y-treeElement.coord.y}
              scaler={scaler}
              onDragEnd={onDragEnd}
              isLeaf={true}
             />
            </g>
        )}
    </g> 
}