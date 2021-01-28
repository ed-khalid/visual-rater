import { select } from "d3-selection";
import { event as d3Event } from 'd3'
import { Scaler } from "../../../functions/scale";
import { RatedItem } from "../../../models/RatedItem";

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
    dragStart : (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
        if (g) {
            select(g).select('g.close-button').classed('hide', true);
            select(g).classed('active', true);
        }
    },   
    dragInProgress : (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
          if (!isDragInBounds(d3Event.y)) {
              return;
          }
          if (g) {
            select(g).selectAll('.item-symbol').attr('cy', d3Event.y)
            select(g).selectAll('text').attr('y', d3Event.y)
            select(g).selectAll('text.item-score').text(scaler.toScore(d3Event.y).toFixed(2));
          }
    },
    dragEnd : (d:any, i:number, nodeList:ArrayLike<SVGElement> ) => {
        if (g) {
          select(g).select('g.close-button').classed('hide', false);
          const yPosition = Number(select(g).select('.item-symbol').attr('cy'));        
          const score = scaler.toScore(yPosition);  
          onDragEnd(item.id, score)
          select(g).classed('active', false);
        }
    }   
    }

} 