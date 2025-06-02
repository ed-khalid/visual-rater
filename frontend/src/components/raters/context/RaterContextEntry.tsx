import { RaterContextEntryModel } from "../../../models/RaterModels"
import './RaterContextEntry.css'

interface Props {
    entry: RaterContextEntryModel 
    onDelete: (entry:RaterContextEntryModel) => void
    onToggle: (entry:RaterContextEntryModel) => void
}



export const RaterContextEntry = ({entry, onToggle}:Props) => {

    const thumbnailClassname = (entry.type === 'album') ? 'thumbnail smaller' : 'thumbnail'   
    

    return <div className="rater-context-entry">
        <div className="flex">
            <div className="actions">
            </div>
            <div className={thumbnailClassname}>
                <img onClick={() => onToggle(entry)} src={entry.thumbnail || ''} />
            </div>
            {entry.type === 'artist' && <div className="name">{entry.name}</div>}
        </div>
    </div>
}