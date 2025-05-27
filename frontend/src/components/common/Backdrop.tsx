import { motion } from 'motion/react'
interface Props {
    children:any
    onClick:any
}

export const Backdrop = ({children, onClick}:Props) => {
    return <motion.div
    className="backdrop"
    onClick={onClick}
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    exit={{opacity: 0}}
    >
        {children}
    </motion.div>
}  