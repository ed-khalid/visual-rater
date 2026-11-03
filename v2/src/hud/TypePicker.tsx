import { useStore } from '../state/store'
import './typepicker.css'

/** Landing screen: pick what kind of thing to rank. Shown whenever no board is open. */
export const TypePicker = () => {
  const types = useStore(s => s.types)
  const openType = useStore(s => s.openType)

  return <div className="picker">
    <div className="picker-prompt">WHAT ARE WE RANKING?</div>
    <ul className="picker-list">
      {Object.values(types).map(t =>
        <li key={t.id}><button className="picker-type" onClick={() => openType(t.id)}>{t.name}</button></li>
      )}
    </ul>
  </div>
}
