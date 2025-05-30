import { useContext } from "react";
import { LinearRaterCircleModel, LinearRaterGroup } from "../../../models/RaterModels";
import { LinearRaterContext } from "../../../providers/LinearRaterProvider";
import { motion } from 'motion/react'
import { LinearRaterCircle } from "./LinearRaterCircle";
import { LinearRaterConfig } from "../../../models/LinearRaterModel";

interface Props {
    item: LinearRaterGroup
    largestGroupItemCount: number
}

type GroupCircleModel = {
  circleModel:LinearRaterCircleModel,
  color: string
  position: number
} 

export const LinearRaterGroupItem = ({item, largestGroupItemCount}:Props) => {

    const { getScoreCategoryDetails  } = useContext(LinearRaterContext)

    const config = LinearRaterConfig.connectingLine 
    const fontConfig = LinearRaterConfig.font 

    const position = item.position 
    const itemsCount = item.items.flatMap(it => it.items).length 
    const lineOffsetX = config.end(itemsCount) 
    console.log()
    var circleModels:GroupCircleModel[] = []
    item.items.forEach((singleItem) => {
      const { color  } = getScoreCategoryDetails(singleItem.score)
      const itemCircles = singleItem.items.map((circleModel) => ({ circleModel, color, position }))
      circleModels = [...circleModels, ...itemCircles ] 
    })


    return <g
              className="linear-rater-group" 
              id={`linear-rater-item-group-${item.id}`}
           >
        <motion.line
          initial={{opacity: 0, x2: config.start}}
          animate={{opacity: 1, x2: lineOffsetX}}
          exit={{opacity: 0, x2:config.start}}
          transition={{ duration: 0.3, ease: 'easeInOut'}}
          x1={config.start}
          y1={position}
          x2={lineOffsetX}
          y2={position}
          stroke={config.stroke}
          strokeWidth={config.strokeWidth}
        />
        {circleModels.map((circle, i) => <LinearRaterCircle key={`linear-rater-circle-${circle.circleModel.id}`} item={circle.circleModel} i={i} position={circle.position} color={circle.color} />)}

        <motion.text 
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{ delay: config.scoreLabel.animation.delay, ease: 'easeInOut' }}
        x={config.scoreLabel.x(largestGroupItemCount)  } y={config.scoreLabel.y(position)} fontSize={fontConfig.size} fill={fontConfig.fill}>
            {item.scoreRange.low + ' - ' + item.scoreRange.high}
        </motion.text>

    </g>
}