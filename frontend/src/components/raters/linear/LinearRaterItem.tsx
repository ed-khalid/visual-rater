import { LinearRaterCircle } from "./LinearRaterCircle"
import { LinearRaterContext } from "../../../providers/LinearRaterProvider"
import { motion } from 'motion/react'
import { useContext } from "react"
import { LinearRaterConfig } from "../../../models/LinearRaterConfig"
import { LinearRaterItemModel } from "../../../models/LinearRaterModels"

interface Props {
    item:LinearRaterItemModel
    largestGroupItemCount: number
}


export const LinearRaterItem = ({ item, largestGroupItemCount}: Props) => {

    const { yToScore, getScoreCategoryDetails  } = useContext(LinearRaterContext)

    const position = yToScore.invert(item.score)   
    const { category, color } = getScoreCategoryDetails(item.score) 
    const config = LinearRaterConfig.connectingLine
    const fontConfig = LinearRaterConfig.font

    const lineOffsetX = config.end(item.items.length) 

    return <g
              className="linear-rater-group" 
              id={`linear-rater-item-group-${item.id}`}
           >
        {/* Connecting Line */}
        <motion.line
          initial={{opacity: 0, x2: config.start}}
          animate={{opacity: 1, x2: lineOffsetX}}
          exit={{opacity: 0, x2:config.start}}
          transition={{ duration: config.animation.duration, ease: 'easeInOut'}}
          x1={config.start}
          y1={position}
          x2={lineOffsetX}
          y2={position}
          stroke={config.stroke}
          strokeWidth={config.strokeWidth}
        />

        {item.items.map( (circleModel, i) => 
            (<LinearRaterCircle key={`linear-rater-item-circle-${circleModel.id}`} color={color} item={circleModel} i={i} position={position} />
            )
        )}
        {/* Score */}
        <motion.text 
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{ delay: config.scoreLabel.animation.delay, ease: 'easeInOut' }}
        x={config.scoreLabel.x(largestGroupItemCount)} y={config.scoreLabel.y(position)} fontSize={fontConfig.size} fill={fontConfig.fill}>
            {item.score}
        </motion.text>

        {/* Category */}
        <motion.text
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{ delay: config.category.animation.delay, ease: 'easeInOut' }}
         x={config.category.x} y={config.category.y(position)} fontSize={fontConfig.size} fill={fontConfig.fill}>
          {category}
        </motion.text>
    </g>

} 