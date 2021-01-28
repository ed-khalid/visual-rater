import { Scaler } from "../../../functions/scale";
import { Position } from "../../../models/Position";

interface Props {

}


export const PanBehavior =  () => {

    let panPoint:{x:number,y:number}|undefined;

    return {
        startPan : (e:MouseEvent) => {
            panPoint = {x:e.offsetX, y:e.offsetY}
            console.log('pan start',{x:e.x, y:e.y})
        },
        duringPan:  (e:MouseEvent, scaler:Scaler, {start, end}:{start:string, end:string}) => {
            if (panPoint) {
                const point:Position = { x: e.offsetX, y:e.offsetY}  
                const original = scaler.toScore(panPoint.y)  
                const delta = scaler.toScore(point.y) - original  
                const min = Math.max(Number(start) - delta, 0)     
                const max = Math.min(Number(end) - delta, 5)  
                return { start: min.toFixed(2), end: max.toFixed(2)}
            }
        },
        endPan: (e:MouseEvent) => {
            const point:Position = {x:e.offsetX, y:e.offsetY}
            console.log('pan end', point)
            if (point.x === panPoint?.x && point.y === panPoint?.y) {
                panPoint = undefined
                return true
            } else {
                panPoint = undefined
                return false
            }
        }
    }
}