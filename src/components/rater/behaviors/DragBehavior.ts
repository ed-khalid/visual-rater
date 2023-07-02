import { select, selectAll } from "d3-selection";
import { Scaler } from "../../../functions/scale";
import { RatedItem } from "../../../models/RatedItem";
import { Position } from "../../../models/Position";

interface Props {
    raterBottom:number
    g:SVGGElement|undefined
    scaler:Scaler
    item:RatedItem
    onDragEnd:(id:string, score:number ) => void
}


export const DragBehavior = ({raterBottom, item, g, scaler, onDragEnd}:Props) => {
    const isDragInBounds = (_y:number) => {
        return _y  >= 5  && _y <= raterBottom - 5; 
    }

    return {
    dragStart : (event:any) => {
        const nodes = selectAll('svg#trackRater g.item.selected').nodes()
        sessionStorage.setItem('dragStartPoint', JSON.stringify({x:event.x, y:event.y}))    
        if (nodes.length === 0 && g) {
            const y = Number(select(g).select('text').attr('y'))
            select(g).classed('selected', true)
            sessionStorage.setItem('node0', JSON.stringify({x: undefined, y}) )
        } else {
            nodes.forEach((node,index) => {
                const gNode = select(node)
                const y = Number(select(node).select('text').attr('y'))
                sessionStorage.setItem(`node${index}`, JSON.stringify({x:undefined, y}))
            })
        }
    },   
    dragInProgress : (event:any) => {
          if (!isDragInBounds(event.y)) {
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
                const delta = event.y - dragPoint.y   
                const newPos = nodeOriginalPosition.y+delta 
                gNode.select('.item-symbol').attr('cy', newPos )
                gNode.selectAll('text').attr('y',  newPos)
                gNode.select('text.item-score').text(scaler.toScore(newPos).toFixed(2));
                }
              }
          })
    },
    dragEnd : (event:any) => {
        sessionStorage.clear()
        const nodes = selectAll('svg#trackRater g.item.selected').nodes()
        nodes.forEach((g) => {
                select(g).select('g.close-button').classed('hide', false);
                const item:RatedItem = select(g).data()[0] as RatedItem
                const yPosition = Number(select(g).select('.item-symbol').attr('cy'));        
                const score = scaler.toScore(yPosition);  
                onDragEnd(item.id, score)
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