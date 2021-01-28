import { select } from 'd3-selection';
import { zoom } from 'd3-zoom'
import { event as d3Event } from 'd3';
import { Scaler } from '../../../functions/scale';
import { RatedItemGrouped } from '../Rater';
interface Props {
    listener:SVGRectElement
    target:SVGGElement
}

export const ZoomBehavior = ({listener,target}:Props) => {

    // const doZoom = () => {
    //     const transform = d3Event.transform 
    //     console.log('transform', transform)
    //     select(target).attr('transform', `translate(0, ${transform.y})`)
    // }
    // const zoomHandler = zoom<SVGRectElement, unknown>().on('zoom', doZoom) 
    // select(listener).call(zoomHandler)

    return {
        zoomOnGroup: (group:RatedItemGrouped) =>  {
            const min = group.items.reduce((curr,it) => Math.min(it.score,curr)  , Infinity)  
            const max = group.items.reduce((curr,it) => Math.max(it.score,curr)  , -Infinity)  
            console.log(min,max)
            return { start:(min-0.05)+'', end:(max+0.05)+'' }
        }, 
        zoomIn: (e:MouseEvent, scaler:Scaler) => {
            const y = e.offsetY;  
            const score = scaler.toScore(y) 
            const min = Math.min((score - 0.25) || 0) 
            const max = Math.min((score + 0.25) || 5) 
            return { start:min.toFixed(2), end:max.toFixed(2)} 
        } 
    }
}