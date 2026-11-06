import { TYPES } from '../shared/model'
import { useStore } from '../state/store'
import './typepicker.css'

/** Landing screen: pick what kind of thing to rank. Shown whenever no tree is open. */
export const TypePicker = () => {
  const openType = useStore(s => s.openType)

  return <div className="picker">
    <div className="picker-prompt">WHAT ARE WE RANKING?</div>
    <ul className="picker-list">
      {TYPES.map(t =>
        <li key={t.id}><button className="picker-type" onClick={() => openType(t.id)}>{t.name}</button></li>
      )}
    </ul>
  </div>
}
