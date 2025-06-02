import { LinearRaterItemModel } from "../../../models/RaterModels"
import { motion } from "motion/react"
import { LinearRaterCircle } from "./LinearRaterCircle"
import { UNRATED_COLOR } from "../../../models/ScoreModels"
import { LinearRaterConfig } from "../../../models/LinearRaterConfig"

interface Props {
    item: LinearRaterItemModel  
    y: number 
}

export const UnratedLinearRaterItem = ({y, item}:Props) => {

    const connectingLineConfig = LinearRaterConfig.connectingLine 
    const lineEnd = LinearRaterConfig.connectingLine.end(item.items.length) 
    const lineStart = LinearRaterConfig.connectingLine.start 
    const animationDuration = connectingLineConfig.animation.duration 

    return <g
              className="linear-rater-group" 
              id={`linear-rater-item-group-${item.id}`}
           >
        {/* Connecting Line */}
        <motion.line
          initial={{opacity: 0, x2: lineStart}}
          animate={{opacity: 1, x2: lineEnd}}
          exit={{opacity: 0, x2:lineStart}}
          transition={{ duration: animationDuration, ease: 'easeInOut'}}
          x1={lineStart}
          y1={y}
          x2={lineEnd}
          y2={y}
          stroke={connectingLineConfig.stroke}
          strokeWidth={connectingLineConfig.strokeWidth}
        />

        {item.items.map( (circleModel, i) => 
            (<LinearRaterCircle key={`unrated-linear-circle-${circleModel.id}`} color={UNRATED_COLOR} item={circleModel} i={i} position={y} />
            )
        )}

        {/* Category */}
        <motion.text
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{ delay: connectingLineConfig.category.animation.delay, ease: 'easeInOut' }}
         x={connectingLineConfig.category.x} y={connectingLineConfig.category.y(y)} fontSize={connectingLineConfig.category.fontSize} fill={connectingLineConfig.category.fill}>
          {'UNRATED'}
        </motion.text>
    </g>
}