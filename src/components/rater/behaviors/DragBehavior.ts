import { select, selectAll } from "d3-selection";
import { Scaler, clampToNearestIncrement } from "../../../functions/scale";
import { Position, SongItemPosition } from "../../../models/ui/Position";
import { RatedItem } from "../../../models/domain/ItemTypes";
import { RATER_Y_BOTTOM } from "../../../models/ui/RaterTypes";

interface Props {
    g:SVGGElement|undefined
    scaler:Scaler
    item:RatedItem
    onDragEnd:(id:string, score:number ) => void
}


export const DragBehavior = ({item, g, scaler, onDragEnd}:Props) => {
    const isDragInBounds = (_y:number) => {
        return _y  >= 5  && _y <= RATER_Y_BOTTOM - 5; 
    }

    return {
    dragStart : (event:any) => {
        const nodes = selectAll('svg#trackRater g.item.selected').nodes()
        sessionStorage.setItem('dragStartPoint', JSON.stringify({x:event.x, y:event.y}))    
        if (nodes.length === 0 && g) {
            const gNode = select(g)
            select(g).classed('selected', true)
            const imageY = Number(gNode.select('.item-thumbnail').attr('y'))
            const lineY1 = Number(gNode.select('.item-scoreline').attr('y1'))
            const lineY2 = Number(gNode.select('.item-scoreline').attr('y2'))
            const nameY = Number(gNode.select('.item-name').attr('y'))
            const scoreY = Number(gNode.select('.item-score').attr('y'))
            sessionStorage.setItem(`node0`, JSON.stringify({x:undefined, y: { image: imageY, line: { y1: lineY1, y2:lineY2 }, score: scoreY, name: nameY}}))
        } else {
            nodes.forEach((node,index) => {
                const gNode = select(node)
                const imageY = Number(gNode.select('.item-thumbnail').attr('y'))
                const lineY1 = Number(gNode.select('.item-scoreline').attr('y1'))
                const lineY2 = Number(gNode.select('.item-scoreline').attr('y2'))
                const nameY = Number(gNode.select('.item-name').attr('y'))
                const scoreY = Number(gNode.select('.item-score').attr('y'))
                sessionStorage.setItem(`node${index}`, JSON.stringify({x:undefined, y: { image: imageY, line: { y1: lineY1, y2:lineY2 }, score: scoreY, name: nameY}}))
                console.log(sessionStorage.getItem(`node${index}`))

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
              const nodeOriginalPosition = JSON.parse(_nodeY) as SongItemPosition 
              if (_dragPoint) {
                const gNode = select(node) 
                const dragPoint = JSON.parse(_dragPoint) as Position 
                const delta = event.y - dragPoint.y   
                const newPos:SongItemPosition = {
                    y: {
                        line: {
                            y1: nodeOriginalPosition.y.line.y1 + delta,
                            y2: nodeOriginalPosition.y.line.y2 + delta
                        },
                        rect: nodeOriginalPosition.y.rect + delta,
                        name: nodeOriginalPosition.y.name + delta,
                        score: event.y,
                        image: nodeOriginalPosition.y.image + delta,
                    }
                } 
                gNode.select('.item-thumbnail').attr('y', newPos.y.image )
                gNode.select('.item-name').attr('y', newPos.y.name )
                gNode.select('.item-score').attr('y', newPos.y.score )
                gNode.select('.item-scoreline').attr('y1', newPos.y.line.y1 )
                gNode.select('.item-scoreline').attr('y2', newPos.y.line.y2 )
                gNode.select('text.item-score').text(clampToNearestIncrement(scaler.toScore(newPos.y.score)));
                }
              }
          })
    },
    dragEnd : (event:any) => {
        sessionStorage.clear()
        const nodes = selectAll('svg#trackRater g.item.selected').nodes()
        nodes.forEach((g) => {
                const item:RatedItem = select(g).data()[0] as RatedItem
                const yPosition = Number(select(g).select('.item-score').attr('y'));        
                const score = clampToNearestIncrement(scaler.toScore(yPosition));  
                onDragEnd(item.id, score)
                select(g).classed('selected', false);
          })
    }   
    }

} 