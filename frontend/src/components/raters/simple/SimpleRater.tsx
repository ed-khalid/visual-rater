import { DndContext } from "@dnd-kit/core"
import { FatSong } from "../../../models/RaterTypes"
import { SONG_SCORE_DICTIONARY, SongScoreUIBase } from "../../../models/ScoreTypes"
import './SimpleRater.css'
import { SimpleRaterCategoryRow } from "./SimpleRaterCategoryRow"

interface Props {
    items:FatSong[]
    onUpdate: (song:FatSong) => any 
}

export const SimpleRater = ({items, onUpdate}: Props) => {

    const categories = Array.from(SONG_SCORE_DICTIONARY.values())  
    const categoryItemsMap:Map<SongScoreUIBase, FatSong[]> = new Map()  
    const isItemInCategory = (item:FatSong, category:SongScoreUIBase) => {
        if (item.song.score === undefined || item.song.score === null) {
            if (category.category === 'UNRATED') {
                return true 
            } else return false
        } 
        return  category.threshold.low  <= item.song.score && item.song.score <= category.threshold.high 
    }
    categories.forEach((it) => {
        const categoryItems = items.filter( item => isItemInCategory(item, it))
        categoryItemsMap.set(it, categoryItems)
    })

    const handleDragEnd = (event:any) => {
        const songId = event.active.data.current.item.id  
        const score = event.over.data.current.score  
        const fatSong = items.find(it => it.song.id === songId) 
        if (!fatSong) throw "unrated song not found!"
        const newSong = {...fatSong, song: {...fatSong.song, score}}
        onUpdate(newSong)
    }

    return <DndContext onDragEnd={handleDragEnd}><div id="simple-rater">
        {categories.map((it) => 
        <SimpleRaterCategoryRow key={it.category + '-row'} 
        category={it}
        items={categoryItemsMap.get(it) || []}
        />
        )}
    </div>
    </DndContext>




}