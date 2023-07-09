import { select, Selection } from 'd3-selection';
import { zoom } from 'd3-zoom'
import { Scaler } from '../../../functions/scale';
import { RatedSongItemGrouped } from '../Rater';
import { ScaleLinear } from 'd3-scale' 
import { Dispatch, SetStateAction } from 'react';
import { GlobalRaterState } from '../../../models/ui/RaterTypes';
interface Props {
    listener:SVGRectElement|null
    scale:ScaleLinear<number,number>
    setState:Dispatch<SetStateAction<GlobalRaterState>>
}

export const ZoomBehavior = ({listener, scale, setState}:Props) => {

    if (listener) {
        const doZoom = (event:any) => {
            const transform = event.transform 
            const newScale = transform.rescaleY(scale) 
            setState(s => ({...s, scaler: new Scaler(newScale)}) )
        }
        const zoomHandler = zoom<SVGRectElement, unknown>()
          .scaleExtent([0,5])
          .on('zoom', doZoom) 
        select(listener).call(zoomHandler)
    }

    return {
        zoomOnGroup: (group:RatedSongItemGrouped) =>  {
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