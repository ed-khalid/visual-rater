import { select } from 'd3-selection'
import { event as d3Event } from 'd3'
import { selectCircle } from '../../../functions/select'


export const SelectionRectangle = (svgRef:SVGSVGElement) => {

    const SELECTION_RECT_CLASS = 'selection-rectangle'  

        const convertToSvgCoordinate = (e:MouseEvent): {x:number,y:number} =>  {
            const p = svgRef.createSVGPoint()
            p.x = e.clientX;  
            p.y = e.clientY;
            return p.matrixTransform(svgRef.getScreenCTM()?.inverse())
        } 

        const mouseDown = () => {
            const e = convertToSvgCoordinate(d3Event as MouseEvent)   
            select(svgRef)
              .append('rect')
              .attr('rx', 6)
              .attr('ry', 6)
              .attr('class', SELECTION_RECT_CLASS)
              .attr('x',  e.x)
              .attr('y',  e.y)
              .attr('width', 0)
              .attr('height',0)
        }  
        const mouseMove = () => {
            const e = convertToSvgCoordinate(d3Event as MouseEvent)
            const rect = select(svgRef).select(`rect.${SELECTION_RECT_CLASS}`) 
            if (!rect.empty()) {
                const rectState = {
                    x : parseInt(rect.attr('x'), 10),
                    y : parseInt(rect.attr('y'), 10),
                    width:  parseInt(rect.attr('width'), 10),
                    height: parseInt(rect.attr('height'), 10) 
                }   
                const delta = {
                    x : e.x - rectState.x, 
                    y : e.y - rectState.y 
                } 
                if (delta.x  < 1  || (delta.x*2 < rectState.width)) {
                    rectState.x = e.x  
                    rectState.width -= delta.x; 
                } else {
                    rectState.width = delta.x;
                }
                if (delta.y < 1 || delta.y *2 < rectState.height) {
                    rectState.y =  e.y
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
            const rect = select(svgRef).select(`rect.${SELECTION_RECT_CLASS}`)  
            select(svgRef).selectAll<SVGGElement, unknown>('g.item').nodes().forEach((gNode) => {
                const circle = select(gNode).select<SVGCircleElement>('circle')
                const [rectX, rectY, rectWidth, rectHeight] = [rect.attr('x'), rect.attr('y'), rect.attr('width'), rect.attr('height')].map( it => parseInt(it, 10)) 
                const [x ,y] = [circle.attr('cx'), circle.attr('cy')].map(it => parseInt(it, 10))
                if ( x > rectX && x < (rectX + rectWidth) && y > rectY && y < (rectY +rectHeight)) {
                    select(gNode).classed('selected', true)
                }
            })
            select(svgRef).selectAll(`rect.${SELECTION_RECT_CLASS}`).remove()
        }

        select(svgRef)
        .on('mousedown', mouseDown)
        .on('mousemove', mouseMove)
        .on('mouseup', mouseUp)
}