import { select, selectAll } from "d3-selection";
import { event as d3Event } from 'd3'
import { Scaler } from "../../../functions/scale";
import { RatedItem } from "../../../models/RatedItem";
import { Position } from "../../../models/Position";
import { Dispatch, SetStateAction } from "react";

interface Props {
    raterBottom:number
    g:SVGGElement|undefined
    dragPoint:Position|undefined
    setDragPoint:Dispatch<SetStateAction<Position|undefined>>
    scaler:Scaler
    item:RatedItem
    onDragEnd:(id:string, score:number ) => void
}


export const DragBehavior = ({raterBottom, item, g, scaler, onDragEnd}:Props) => {
    const isDragInBounds = (_y:number) => {
        return _y  >= 5  && _y <= raterBottom - 5; 
    }

    return {
    dragStart : (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
        const nodes = selectAll('svg#trackRater g.item.selected').nodes()
        sessionStorage.setItem('dragStartPoint', JSON.stringify({x:d3Event.x, y:d3Event.y}))    
        if (nodes.length === 0 && g) {
            const y = Number(select(g).select('text').attr('y'))
            select(g).select('g.close-button').classed('hide', true);
            select(g).classed('selected', true)
            sessionStorage.setItem('node0', JSON.stringify({x: undefined, y}) )
        } else {
            nodes.forEach((node,index) => {
                const gNode = select(node)
                gNode.select('g.close-button').classed('hide', true)
                const y = Number(select(node).select('text').attr('y'))
                sessionStorage.setItem(`node${index}`, JSON.stringify({x:undefined, y}))
            })
        }
        console.log(sessionStorage)
    },   
    dragInProgress : (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
          if (!isDragInBounds(d3Event.y)) {
              return;
          }
          const nodes = selectAll('svg#trackRater g.item.selected').nodes()
          nodes.forEach((node,index) => {
              const _dragPoint = sessionStorage.getItem("dragStartPoint")
              const _nodeY = sessionStorage.getItem(`node${index}`)    
              if (_nodeY) {
              const nodeOriginalPosition = JSON.parse(_nodeY) as Position 
              if (_dragPoint) {
                const gNode = select(node) 
                const dragPoint = JSON.parse(_dragPoint) as Position 
                const delta = d3Event.y - dragPoint.y   
                const newPos = nodeOriginalPosition.y+delta 
                gNode.select('.item-symbol').attr('cy', newPos )
                gNode.selectAll('text').attr('y',  newPos)
                gNode.select('text.item-score').text(scaler.toScore(newPos).toFixed(2));
                }
              }
          })
    },
    dragEnd : (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
        sessionStorage.clear()
        const nodes = selectAll('svg#trackRater g.item.selected').nodes()
        nodes.forEach((g) => {
                select(g).select('g.close-button').classed('hide', false);
                // const yPosition = Number(select(g).select('.item-symbol').attr('cy'));        
                // const score = scaler.toScore(yPosition);  
                // onDragEnd(item.id, score)
                select(g).classed('selected', false);
          })
        // if (g) {
        //   select(g).select('g.close-button').classed('hide', false);
        //   const yPosition = Number(select(g).select('.item-symbol').attr('cy'));        
        //   const score = scaler.toScore(yPosition);  
        //   onDragEnd(item.id, score)
        //   select(g).classed('active', false);
        // }
    }   
    }

} 