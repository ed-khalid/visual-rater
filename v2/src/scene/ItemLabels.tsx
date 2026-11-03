import { useStore } from '../state/store'
import { labelElements } from './labels'
import './items.css'

/**
 * DOM layer holding one name label per item on the open board: beside placed items, under staged ones.
 * The 3D objects position them every frame (see Items.tsx and StagingArea.tsx).
 */
export const ItemLabels = () => {
  const placements = useStore(s => s.placements)
  const staged = useStore(s => s.staged)
  const items = useStore(s => s.items)
  const activeBoardId = useStore(s => s.activeBoardId)

  const labels = [
    ...placements.filter(p => p.boardId === activeBoardId && items[p.itemId]).map(p => ({ id: p.itemId, kind: 'side' })),
    ...staged.filter(p => p.boardId === activeBoardId && items[p.itemId]).map(p => ({ id: p.itemId, kind: 'below' })),
  ]

  return <div className="item-labels">
    {labels.map(({ id, kind }) =>
      <div
        key={id}
        className={`item-label item-label-${kind}`}
        title={items[id].name}
        ref={el => {
          if (el) labelElements.set(id, el)
          return () => { labelElements.delete(id) }
        }}
      >
        {items[id].name}
      </div>
    )}
  </div>
}
