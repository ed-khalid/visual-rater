import { select } from "d3-selection"


export const AnimationBehavior = {

    hide : (target:SVGGElement) => {
        select(target).selectAll('.item-scoreline').transition().duration(1000).attr('color', 'red')
    }

}