import { select } from 'd3-selection'
import { event as d3Event} from 'd3'


export const SelectionRectangle = (svgRef:SVGSVGElement) => {

    const SELECTION_RECT_CLASS = 'selection-rectangle'  



        const mouseDown = () => {
            const e = d3Event as MouseEvent   
            select(svgRef)
              .append('rect')
              .attr('rx', 6)
              .attr('ry', 6)
              .attr('class', SELECTION_RECT_CLASS)
              .attr('x',  e.offsetX)
              .attr('y',  e.offsetY)
              .attr('width', 0)
              .attr('height',0)
        }  
        const mouseMove = () => {
            const e = d3Event as MouseEvent
            console.log('e x y', e.x, e.y)
            console.log('e offset', e.offsetX, e.offsetY)
            console.log('e client', e.clientX, e.clientY)
            console.log('e page', e.pageX, e.pageY)
            const rect = select(svgRef).select(`rect.${SELECTION_RECT_CLASS}`) 
            if (!rect.empty()) {
                const rectState = {
                    x : parseInt(rect.attr('x'), 10),
                    y : parseInt(rect.attr('y'), 10),
                    width:  parseInt(rect.attr('width'), 10),
                    height: parseInt(rect.attr('height'), 10) 
                }   
                const delta = {
                    x : e.offsetX - rectState.x, 
                    y : e.offsetY - rectState.y 
                } 
                if (delta.x  < 1  || (delta.x*2 < rectState.width)) {
                    rectState.x = e.offsetX  
                    rectState.width -= delta.x; 
                } else {
                    rectState.width = delta.x;
                }
                if (delta.y < 1 || delta.y *2 < rectState.height) {
                    rectState.y =  e.offsetY
                    rectState.height -= delta.y 
                } else {
                    rectState.height = delta.y
                }
                rect.attr('x', rectState.x)
                rect.attr('y', rectState.y)
                rect.attr('width', rectState.width)
                rect.attr('height', rectState.height)
            }
        }
        const mouseUp = () => {
            select(svgRef).selectAll(`rect.${SELECTION_RECT_CLASS}`).remove()
        }

        select(svgRef)
        .on('mousedown', mouseDown)
        .on('mousemove', mouseMove)
        .on('mouseup', mouseUp)
}