import { LinearRaterItemModel } from "../../../models/RaterModels"
import { LinearRaterCircle } from "./LinearRaterCircle"
import { LinearRaterContext } from "../../../providers/LinearRaterProvider"
import { useContext } from "react"

interface Props {
    item:LinearRaterItemModel
}


export const LinearRaterItem = ({ item}: Props) => {

    const { mainlineX, yToScore, getScoreCategoryDetails  } = useContext(LinearRaterContext)

    const position = yToScore.invert(item.score)   
    const { category, color } = getScoreCategoryDetails(item.score) 

    return <g className="linear-rater-group" id={`linear-rater-item-${item.id}`}>
        <line
          x1={mainlineX+20}
          y1={position}
          x2={mainlineX + 200 + ( 50 * (item.items.length - 1)) }
          y2={position}
          stroke="#999"
          strokeWidth={1}
        />

        {item.items.map( (circleModel, i) => 
            (<LinearRaterCircle color={color} item={circleModel} i={i} position={position} />
            )
        )}
        <text x={mainlineX + 230 + (30 * (item.items.length))  } y={position+5} fontSize={12} fill="#fff">
            {item.score}
        </text>

        {/* Label */}
        <text x={mainlineX + 20} y={position - 2} fontSize={12} fill="#fff">
          {category}
        </text>
    </g>

} 