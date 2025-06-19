import { motion } from 'motion/react'
import { useContext } from "react"
import { LinearRaterContext } from '../../../providers/LinearRaterProvider'
import { LinearRaterConfig } from '../../../models/LinearRaterConfig'
import { LinearRaterCircle } from './LinearRaterCircle'
import { LinearRaterCircleModel } from '../../../models/LinearRaterModels'

interface Props {
    item:LinearRaterCircleModel
    i: number
}


export const LinearRaterItem = ({ item, i }: Props) => {

    const { yToScore, getScoreCategoryDetails  } = useContext(LinearRaterContext)

    const position = item.position   
    const score = yToScore(item.position) 
    const { color } = getScoreCategoryDetails(score) 
    const config = LinearRaterConfig.connectingLine
    const fontConfig = LinearRaterConfig.font

    const lineOffsetX = config.end(i+1) 

    return <g
              className="linear-rater-group" 
              id={`linear-rater-item-group-${item.id}`}
           >
        {/* Connecting Line */}
        <motion.line
          initial={{opacity: 0, x2: config.start}}
          animate={{opacity: 0.1, x2: lineOffsetX}}
          exit={{opacity: 0, x2:config.start}}
          transition={{ duration: config.animation.duration, ease: 'easeInOut'}}
          x1={config.start}
          y1={position}
          x2={lineOffsetX}
          y2={position}
          stroke={config.stroke}
          strokeWidth={config.strokeWidth}
        />

        <LinearRaterCircle key={`linear-rater-item-circle-${item.id}`} color={color} item={item} i={i} position={position} />
        {/* Score */}
        <motion.text 
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{ delay: config.scoreLabel.animation.delay, ease: 'easeInOut' }}
        x={config.scoreLabel.x(lineOffsetX)} y={config.scoreLabel.y(position)} fontSize={fontConfig.size} fill={fontConfig.fill}>
            {score}
        </motion.text>
    </g>

} 