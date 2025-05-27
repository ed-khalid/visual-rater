import { select } from "d3-selection";
import { ANIMATION_DURATION, CARTESIAN_RATER_TIER_WIDTH, CARTESIAN_SVG_IMAGE_SIZE, CartesianRaterItem } from "../../models/CartesianRaterModels";

    export const animateOnEnter = (item:CartesianRaterItem, mainlineX:number) => {
        const tierOffset = CARTESIAN_RATER_TIER_WIDTH * item.tier! 
        const imageSize = CARTESIAN_SVG_IMAGE_SIZE;
        const x = (mainlineX + tierOffset) 
        select(item.nodeRef.current).select('.rater-item.item-scoreline').transition().duration(ANIMATION_DURATION).attr('x1', x)
        select(item.nodeRef.current).select('.rater-item.item-thumbnail').transition().duration(ANIMATION_DURATION).attr('x', x)
        select(item.nodeRef.current).select('.rater-item.item-thumbnail-overlay').transition().duration(ANIMATION_DURATION).attr('cx', x+imageSize/2)
        select(item.nodeRef.current).select('.rater-item.item-thumbnail-border').transition().duration(ANIMATION_DURATION).attr('cx', x+imageSize/2)
        select(item.nodeRef.current).select('.rater-item.item-name').transition().duration(ANIMATION_DURATION).attr('x', x+imageSize/2)
        select(item.nodeRef.current).select('.rater-item.item-score').transition().duration(ANIMATION_DURATION).attr('x', x+imageSize/2)
    } 

    export const animateOnExit = (item:CartesianRaterItem, mainlineX:number)  => {
        const EXIT_DURATION = ANIMATION_DURATION + 200; 
        const tierOffset = CARTESIAN_RATER_TIER_WIDTH * item.tier!
        const imageSize = CARTESIAN_SVG_IMAGE_SIZE;
        const x = (mainlineX - tierOffset) 
        select(item.nodeRef.current).select('.rater-item.item-thumbnail').transition().duration(EXIT_DURATION).attr('x', x)
        select(item.nodeRef.current).select('.rater-item.item-thumbnail-overlay').transition().duration(EXIT_DURATION).attr('cx', x+imageSize/2)
        select(item.nodeRef.current).select('.rater-item.item-thumbnail-border').transition().duration(ANIMATION_DURATION).attr('cx', x-imageSize/2)
        select(item.nodeRef.current).select('.rater-item.item-scoreline').transition().duration(EXIT_DURATION).attr('x1', x+imageSize)
        select(item.nodeRef.current).select('.rater-item.item-name').transition().duration(EXIT_DURATION).attr('x', x+imageSize/2)
        select(item.nodeRef.current).select('.rater-item.item-score').transition().duration(EXIT_DURATION).attr('x', x+imageSize/2)
    }