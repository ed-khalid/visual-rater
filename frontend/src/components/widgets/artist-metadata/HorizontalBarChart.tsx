import { motion } from 'motion/react'

interface Props {
    items:{label:string, value:number, color:string}[]
    maxValue:number
}


export const HorizontalBarChart = ({items, maxValue}:Props) => {


    return <div className="chart-container">
        {items.map((item) => (
          <div className="bar-row" key={item.label}>
            <div className="bar-label">{item.label}</div>
            <div className="bar-track">
                <motion.div
                className="bar-fill"
                style={{backgroundColor: (item.color) ? item.color : '#3b82f6' }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 0.3 }}
                />
            </div>
            <div className="bar-value">{item.value}</div>
          </div>
        ))}
      </div>

}