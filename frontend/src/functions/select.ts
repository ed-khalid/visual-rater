
import { Selection } from 'd3-selection'

export const selectCircle = (circle:Selection<SVGCircleElement, unknown, null, undefined>) => {
    circle.classed('selected', true)
}    
export const deselectCircle = (circle:Selection<SVGCircleElement, unknown, null, undefined>) => {
    circle.classed('selected', false)
}