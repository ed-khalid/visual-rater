import { motion } from 'framer-motion'
import './VisRaterButton.css'
import { ReactNode, useState } from 'react'
interface Props {
    children:ReactNode
    onClick:(e:React.MouseEvent) => void
    additionalClassNames?:string 
    animate?:any
}

export const VisualRaterToggleButton = ({children , onClick, additionalClassNames}: Props) => {

    const [isOn, setIsOn] = useState<boolean>(false) 

    const handleOnClick = (e:React.MouseEvent) => {
        setIsOn(prev => !prev)
        onClick(e)
    }

    const className = 'vis-rater-button toggle' 
    + ((additionalClassNames) ? (' ' + additionalClassNames) : '')
    + ((isOn) ? ' ' + 'pressed' : '')

    return <motion.button animate={{backgroundColor: isOn ? '#3b82f6': 'var(--color-general-button)' }} onClick={(e:React.MouseEvent) => handleOnClick(e)} className={className}> 
                    {  children }
           </motion.button>
} 