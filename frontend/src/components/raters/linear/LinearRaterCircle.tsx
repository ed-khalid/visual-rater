import { useContext, useEffect, useRef } from "react"
import { LinearRaterCircleModel } from "../../../models/RaterModels"
import { select } from "d3-selection"
import { drag } from "d3-drag"
import { LinearRaterContext } from "../../../providers/LinearRaterProvider"
import { motion } from 'motion/react'
import { LinearRaterConfig } from "../../../models/LinearRaterModel"

interface Props {
    item:LinearRaterCircleModel 
    i: number
    position: number
    color:string
}

export const LinearRaterCircle = ({item, i, color, position }: Props) => {

    const { raterHeight, yToScore, getScoreCategoryDetails, onDragEnd, onDragStart, onCircleHover } = useContext(LinearRaterContext) 
    const mainlineX = LinearRaterConfig.rater.x 
    const circleConfig = LinearRaterConfig.circle 
    const connectingLineConfig = LinearRaterConfig.connectingLine
    const fontConfig = LinearRaterConfig.font

    const nodeRef = useRef<SVGGElement>(null)  

    useEffect(() => {
        if(nodeRef?.current) {
            const g = select(nodeRef.current)

            const circle = g.select('circle')
            const text = g.select('text')
            const dragbehavior = drag<SVGCircleElement, unknown>().on(
                'drag', (event) => {
                    const newY = Math.max(0, Math.min(raterHeight, event.y)) 
                    circle.attr('cy', newY)
                    text.attr('y', circleConfig.songName.y(newY))
                    g.select('#dragline-line').attr('y1', newY).attr('y2', newY)
                    g.select('#dragline-label').attr('y', connectingLineConfig.category.y(newY)).text(getScoreCategoryDetails(Math.round(yToScore(newY))).category)
                    g.select('#dragline-score').attr('y', newY).text(Math.round(yToScore(newY)))
                }
            ).on('start', (event) => {
                onDragStart(item)
                const group = g.append('g')
                .attr('id', 'dragline-group')
                group.append('line')
                            .attr('x1',connectingLineConfig.start)
                            .attr('y1', circle.attr('cy'))
                            .attr('x2', Number(circle.attr('cx')) - Number(circle.attr('r')) )
                            .attr('y2', circle.attr('cy'))
                            .attr('stroke', 'yellow')
                            .attr('stroke-dasharray', '4 2')
                            .attr('strokeWidth', '2')
                            .attr('id', 'dragline-line')
                group.append('text')
                            .attr('x',connectingLineConfig.start)
                            .attr('y', Number(circle.attr('cy')) - 2)
                            .attr('font-size', fontConfig.size)
                            .attr('fill', 'yellow')
                            .attr('id', 'dragline-label')
                            .text(getScoreCategoryDetails(yToScore(position)).category)
                group.append('text')
                            .attr('x',Number(circle.attr('cx')) + 30)
                            .attr('y', Number(circle.attr('cy')) + 5)
                            .attr('font-size', fontConfig.size)
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
                <motion.circle 
                initial={{opacity: 0, cx: mainlineX  }}
                animate={{opacity: 1, cx: circleConfig.circle.x(i)}}
                onMouseEnter={(e:React.MouseEvent) => onCircleHover(item, { x: e.clientX, y: e.clientY } ) }
                onMouseLeave={(e:React.MouseEvent) => onCircleHover(undefined) }
                transition={{ ease: 'easeInOut'}}
                cx={circleConfig.circle.x(i)}
                cy={position}
                r={circleConfig.circle.radius}
                style={{cursor: 'grab'}}
                fill={color}
                stroke={fontConfig.fill}
                strokeWidth={circleConfig.circle.strokeWidth}
                />
                <motion.text initial={{opacity:0}} 
                             animate={{opacity:1}} 
                             transition={{delay: 0.3}} 
                             x={circleConfig.songName.x(i)} 
                             y={circleConfig.songName.y(position)} 
                             textAnchor="middle" 
                             fontSize={fontConfig.size} 
                             alignmentBaseline="baseline" 
                             fill={fontConfig.fill}
                             >
                    {item.name}
                </motion.text>
            </g>)
} 