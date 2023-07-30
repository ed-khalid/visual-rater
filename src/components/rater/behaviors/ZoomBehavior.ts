import { select, Selection } from 'd3-selection';
import { zoom } from 'd3-zoom'
import { Scaler } from '../../../functions/scale';
import { ScaleLinear } from 'd3-scale' 
import { Dispatch, } from 'react';
import {  RaterUIItemGrouped } from '../../../models/ui/RaterTypes';
import { RaterAction } from '../../../reducers/raterReducer';
interface Props {
    listener:SVGRectElement|null
    axis:Selection<SVGGElement,unknown, null, undefined>
    scale:ScaleLinear<number,number>
    target:any
    stateDispatch:Dispatch<RaterAction>
}

export const ZoomBehavior = (props?:Props) => {

    if (props && props.listener) {
        const doZoom = (event:any) => {
            props.stateDispatch({type: 'ZOOM', data: { eventTransform: event.tranform } })
        }
        const zoomHandler = zoom<SVGRectElement, unknown>()
          .scaleExtent([0,Infinity])
          .on('zoom', doZoom) 
        select(props.listener).call(zoomHandler)
    }

    return {
        zoomOnGroup: (group:RaterUIItemGrouped) =>  {
            const min = group.items.reduce((curr,it) => Math.min(it.score,curr)  , Infinity)  
            const max = group.items.reduce((curr,it) => Math.max(it.score,curr)  , -Infinity)  
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