import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiEdit2 } from "react-icons/fi"; // Pencil icon

interface Props {
    initialValue: string
    fontSize: string
    fontWeight: number
    onUpdate: (name:string) => void
}



export const Editable = ({ initialValue, fontSize, fontWeight, onUpdate }: Props) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialValue);
  const [textWidth, setTextWidth] = useState<number>(0)
  const measureRef = useRef<HTMLSpanElement>(null) 

  useEffect(() => {
    setTitle(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (!editing) {
        onUpdate(title)
    }
  }, [editing])

  useEffect(() => {
    if (measureRef.current) {
        setTextWidth(measureRef.current.offsetWidth)
    }

  }, [title])

  return (
    <div
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
    >
    {/*Hidden span to measure text width*/}
    <span ref={measureRef} style={{position: 'absolute', visibility:'hidden', whiteSpace: 'pre', fontSize, fontWeight }}>
    {title}
    </span>

      {!editing ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize, fontWeight }}>{title}</span>

          <div style={{width: 20, height:20, position: 'relative'}}>
          <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                style={{ position: 'absolute', top:0, left:0, cursor: "pointer" }}
                onClick={() => setEditing(true)}
              >
                <FiEdit2 size={16} color="#888" />
              </motion.div>
          </AnimatePresence>
          </div>
        </div>
      ) : (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setEditing(false)}
          autoFocus
          style={{
            fontSize,
            fontWeight,
            border: "none",
            borderBottom: "1px solid #ccc",
            textAlign: "center",
            outline: "none",
            background: "transparent",
            width: textWidth + 20,
            padding: 0,
          }}
        />
      )}
    </div>
  );
};
