import { motion } from 'motion/react'
import { TYPES } from '../shared/model'
import { useStore } from '../state/store'
import './typepicker.css'

const EASE = [0.16, 1, 0.3, 1] as const

/** Landing screen, a contents page: pick what kind of thing to rank. Shown whenever no tree is open. */
export const TypePicker = () => {
  const openType = useStore(s => s.openType)

  return <div className="picker">
    <motion.div className="picker-kicker" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
      Contents
    </motion.div>
    <motion.h1 className="picker-prompt" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08, ease: EASE }}>
      What are we ranking?
    </motion.h1>
    <motion.div className="picker-rule" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.2, ease: EASE }} />
    <ul className="picker-list">
      {TYPES.map((t, i) =>
        <motion.li key={t.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 + i * 0.09, ease: EASE }}>
          <button className="picker-type" onClick={() => openType(t.id)}>
            <span className="picker-number">{String(i + 1).padStart(2, '0')}</span>
            <span className="picker-name">{t.name.toLowerCase()}</span>
            <span className="picker-arrow" aria-hidden="true">→</span>
          </button>
        </motion.li>
      )}
    </ul>
  </div>
}
