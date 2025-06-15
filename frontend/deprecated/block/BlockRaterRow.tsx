
import { useDroppable } from '@dnd-kit/core';
import { BlockRaterItem } from './BlockRaterItem';
import { mapSongScoreToUI } from '../../../functions/scoreUI';
import { SongUIItem } from '../../../models/CoreModels';
interface Props {
    index:number 
    items: SongUIItem[]|undefined
}


export const BlockRaterRow = ({index, items}:Props) => { 

    // array iterator goes from 0 to 99, we want it in descending order
    const score = 99-index 
    const scoreDescriptor = mapSongScoreToUI(score) 

    const {isOver, setNodeRef} = useDroppable({
        id: 'block-rater-row-' + score,
        data: {
            score 
        }
    }) 
    const style = { color: isOver? 'green': undefined } 

    return <div ref={setNodeRef} style={style}  className="block-rater-row" key={`block-rater-row-${score}`}>
        <div style={{background: scoreDescriptor.color }} className="block-rater-row-header">
            <div className="block-rater-row-header-score-text">
                {score}
            </div>
            <div className='block-rater-row-header-score-category'>
            {scoreDescriptor.category}
            </div>
        </div>
         {items?.map(item => <BlockRaterItem item={item} /> ) }
      </div>
    }