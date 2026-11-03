import { useStore } from '../state/store'
import { labelElements } from './labels'
import './items.css'

/** DOM layer holding one name label per placed item. Nodes in the canvas position them (see Items.tsx). */
export const ItemLabels = () => {
  const placements = useStore(s => s.placements)
  const items = useStore(s => s.items)
  const activeBoardId = useStore(s => s.activeBoardId)

  return <div className="item-labels">
    {placements.filter(p => p.boardId === activeBoardId && items[p.itemId]).map(p =>
      <div
        key={p.itemId}
        className="item-label"
        title={items[p.itemId].name}
        ref={el => {
          if (el) labelElements.set(p.itemId, el)
          return () => { labelElements.delete(p.itemId) }
        }}
      >
        {items[p.itemId].name}
      </div>
    )}
  </div>
}
