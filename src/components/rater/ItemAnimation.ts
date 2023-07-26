import { select } from "d3-selection";
import { RATER_TIER_WIDTH, RaterOrientation, SVG_IMAGE_SIZE } from "../../models/ui/RaterTypes";
import { ANIMATION_DURATION } from "../../models/ui/Animation";
import { RaterUIItem } from "../../models/domain/ItemTypes";

    export const animateOnEnter = (item:RaterUIItem, mainlineX:number) => {
        const tierOffset = RATER_TIER_WIDTH * item.tier 
        const imageSize = SVG_IMAGE_SIZE;
        const x = (item.orientation === RaterOrientation.LEFT) ?(mainlineX - tierOffset) : (mainlineX + tierOffset) 
        select(item.nodeRef.current).select('.item-scoreline').transition().duration(ANIMATION_DURATION).attr('x1', x)
        select(item.nodeRef.current).select('.item-thumbnail').transition().duration(ANIMATION_DURATION).attr('x', x)
        select(item.nodeRef.current).select('.item-thumbnail-overlay').transition().duration(ANIMATION_DURATION).attr('cx', x+imageSize/2)
        select(item.nodeRef.current).select('.item-thumbnail-border').transition().duration(ANIMATION_DURATION).attr('cx', x+imageSize/2)
        select(item.nodeRef.current).select('.item-name').transition().duration(ANIMATION_DURATION).attr('x', x+imageSize/2)
        select(item.nodeRef.current).select('.item-score').transition().duration(ANIMATION_DURATION).attr('x', x+imageSize/2)
    } 

    export const animateOnExit = (item:RaterUIItem, mainlineX:number)  => {
        const EXIT_DURATION = ANIMATION_DURATION + 200; 
        const tierOffset = RATER_TIER_WIDTH * item.tier 
        const imageSize = SVG_IMAGE_SIZE;
        const x = (item.orientation === RaterOrientation.LEFT) ?(mainlineX + tierOffset) : (mainlineX - tierOffset) 
        select(item.nodeRef.current).select('.item-thumbnail').transition().duration(EXIT_DURATION).attr('x', x)
        select(item.nodeRef.current).select('.item-thumbnail-overlay').transition().duration(EXIT_DURATION).attr('cx', x+imageSize/2)
        select(item.nodeRef.current).select('.item-thumbnail-border').transition().duration(ANIMATION_DURATION).attr('cx', x-imageSize/2)
        select(item.nodeRef.current).select('.item-scoreline').transition().duration(EXIT_DURATION).attr('x1', x+imageSize)
        select(item.nodeRef.current).select('.item-name').transition().duration(EXIT_DURATION).attr('x', x+imageSize/2)
        select(item.nodeRef.current).select('.item-score').transition().duration(EXIT_DURATION).attr('x', x+imageSize/2)
    }