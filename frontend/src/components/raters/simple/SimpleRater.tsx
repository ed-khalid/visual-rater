import { Song } from "../../../generated/graphql"
import { SONG_SCORE_DICTIONARY, SongScoreUIBase } from "../../../models/ScoreModels"
import './SimpleRater.css'
import { SimpleRaterCategoryRow } from "./SimpleRaterCategoryRow"

interface Props {
    items:Song[]
    onUpdate: (song:Song) => any 
}

export const SimpleRater = ({items, onUpdate}: Props) => {

    const categories = Array.from(SONG_SCORE_DICTIONARY.values())  
    const categoryItemsMap:Map<SongScoreUIBase, Song[]> = new Map()  
    const isItemInCategory = (item:Song, category:SongScoreUIBase) => {
        if (item.score === undefined || item.score === null) {
            if (category.category === 'UNRATED') {
                return true 
            } else return false
        } 
        return  category.threshold.low  <= item.score && item.score <= category.threshold.high 
    }
    categories.forEach((it) => {
        const categoryItems = items.filter( item => isItemInCategory(item, it))
        categoryItemsMap.set(it, categoryItems)
    })

    const handleDragEnd = (event:any) => {
        const songId = event.active.data.current.item.id  
        const score = event.over.data.current.score  
        const song = items.find(it => it.id === songId) 
        if (!song) throw "unrated song not found!"
        const newSong = {...song, song: {...song, score}}
        onUpdate(newSong)
    }

    return <div id="simple-rater">
        {categories.map((it) => 
        <SimpleRaterCategoryRow key={it.category + '-row'} 
        category={it}
        items={categoryItemsMap.get(it) || []}
        />
        )}
    </div>




}