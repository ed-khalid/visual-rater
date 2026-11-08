import { useView } from '../scene/view'
import './actionLog.css'

/** The last thing done on the read-only rater (view.logAction), one line under the item count. Fades in when it changes. */
export const ActionLog = () => {
  const last = useView(v => v.lastAction)
  if (!last) return null
  return <div className="action-log" role="status" aria-live="polite"><span key={last.seq}>{last.text}</span></div>
}
