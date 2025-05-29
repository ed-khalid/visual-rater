import { motion } from "motion/react";
import { Backdrop } from "./Backdrop";
import { ReactNode } from "react";

const dropIn = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  };

interface Props {
    handleClose: any
    children: ReactNode
}
  

export const Modal = ({ handleClose, children }:Props) => {

    return (
      <Backdrop onClick={handleClose}>
          <motion.div
            onClick={(e) => e.stopPropagation()}  
            className="modal"
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {children}
          </motion.div>
      </Backdrop>
    );
  };

  