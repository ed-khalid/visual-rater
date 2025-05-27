import { useContext, useEffect, useRef } from "react"
import { LinearRaterCircleModel } from "../../../models/RaterModels"
import { select } from "d3-selection"
import { drag } from "d3-drag"
import { LinearRaterContext } from "../../../providers/LinearRaterProvider"
import { easeCubicInOut } from "d3"

interface Props {
    item:LinearRaterCircleModel 
    i: number
    position: number
    color:string
}

export const LinearRaterCircle = ({item, i, color, position }: Props) => {

    const { mainlineX, raterHeight, yToScore, getScoreCategoryDetails, onDragEnd, onDragStart } = useContext(LinearRaterContext) 

    const nodeRef = useRef<SVGGElement>(null)  

    useEffect(() => {
        if(nodeRef?.current) {
            const g = select(nodeRef.current)
            g.attr('transform', `translate(${mainlineX + 300}, 0) ` )
            g.transition()
            .duration(300)
            .ease(easeCubicInOut)
            .attr('transform', 'translate(0,0)')

            const circle = g.select('circle')
            const text = g.select('text')
            const dragbehavior = drag<SVGCircleElement, unknown>().on(
                'drag', (event) => {
                    const newY = Math.max(0, Math.min(raterHeight, event.y)) 
                    circle.attr('cy', newY)
                    text.attr('y', newY - 15)
                    g.select('#dragline-line').attr('y1', newY).attr('y2', newY)
                    g.select('#dragline-label').attr('y', newY-2).text(getScoreCategoryDetails(yToScore(newY)).category)
                    g.select('#dragline-score').attr('y', newY).text(Math.round(yToScore(newY)))
                }
            ).on('start', (event) => {
                onDragStart(item)
                const group = g.append('g')
                .attr('id', 'dragline-group')
                group.append('line')
                            .attr('x1',mainlineX + 20)
                            .attr('y1', circle.attr('cy'))
                            .attr('x2', Number(circle.attr('cx')) - Number(circle.attr('r')) )
                            .attr('y2', circle.attr('cy'))
                            .attr('stroke', 'yellow')
                            .attr('stroke-dasharray', '4 2')
                            .attr('strokeWidth', '2')
                            .attr('id', 'dragline-line')
                group.append('text')
                            .attr('x',mainlineX + 20)
                            .attr('y', Number(circle.attr('cy')) - 2)
                            .attr('font-size', 12)
                            .attr('fill', 'yellow')
                            .attr('id', 'dragline-label')
                            .text(getScoreCategoryDetails(yToScore(position)).category)
                group.append('text')
                            .attr('x',Number(circle.attr('cx')) + 30)
                            .attr('y', Number(circle.attr('cy')) + 5)
                            .attr('font-size', 12)
                            .attr('fill', 'yellow')
                            .attr('id', 'dragline-score')
                            .text(yToScore(Number(circle.attr('cy'))))
                
            })
            .on('end', (event) => {
                const newY = Math.max(0, Math.min(raterHeight, event.y)) 
                const score = yToScore(newY) 
                onDragEnd(item, Math.round(score))
                g.select('#dragline-group').remove()
            })
            circle.call(dragbehavior as any)
        }

    }, [nodeRef, mainlineX, yToScore])

    return  (<g ref={nodeRef} id={"linear-rater-item-" + item.id}>
                <circle 
                cx={mainlineX + 200 + 5 + (i*50)}
                cy={position}
                r={10}
                style={{cursor: 'grab'}}
                fill={color}
                stroke="white"
                strokeWidth={2}
                />
                <text x={mainlineX + 190 + (i*50 - 2)} y={position-15} fontSize={12} fill="#fff">
                    {item.name}
                </text>
            </g>)
} 