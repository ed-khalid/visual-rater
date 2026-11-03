import { useStore } from '../state/store'
import './staging.css'

/**
 * Items added to the open board but not placed yet, in the empty space left of the axis.
 * Each is a round thumbnail with its title underneath. Newest at the bottom.
 */
export const StagingTray = () => {
  const staged = useStore(s => s.staged)
  const items = useStore(s => s.items)
  const activeBoardId = useStore(s => s.activeBoardId)
  const here = staged.filter(st => st.boardId === activeBoardId && items[st.itemId])
  if (here.length === 0) return null

  return <ul className="staging" aria-label="Staged items">
    {here.map(st => {
      const item = items[st.itemId]
      return <li key={st.itemId} className="staging-item" title={item.name}>
        <div className="staging-icon">
          {item.image ? <img src={item.image} alt="" draggable={false} /> : <span className="staging-initial">{item.name.charAt(0)}</span>}
        </div>
        <div className="staging-title">{item.name}</div>
      </li>
    })}
  </ul>
}
