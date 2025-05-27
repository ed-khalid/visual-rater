import { motion } from 'motion/react'
import './VisRaterButton.css'
import { ReactNode } from 'react'
interface Props {
    children:ReactNode
    onClick:(e:React.MouseEvent) => void
    additionalClassNames?:string 
    animate?:any
}

export const VisualRaterButton = ({children , animate, onClick, additionalClassNames}: Props) => {

    const className = 'vis-rater-button' + ((additionalClassNames) ? (' ' + additionalClassNames) : '')

    return <motion.button animate={animate} whileTap={{scale: 0.9}} whileHover={{scale:1.1}} onClick={(e:React.MouseEvent) => onClick(e)} className={className}> 
                    {  children }
           </motion.button>
} 