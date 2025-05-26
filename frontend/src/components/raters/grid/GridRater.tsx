import { RefObject } from "react"
import { FatSong, SongUIItem } from "../../../models/CoreModels"
import './GridRater.css'
import { mapSongToUIItem } from "../../../functions/mapper"
import { GridRaterBlock } from "./GridRaterBlock"

interface Props {
    items: FatSong[] 
    rowRefs: RefObject<HTMLDivElement>[] 
}

export const GridRater = ({items, rowRefs}:Props) => {
    const totalItems = 100
    const itemsPerRow = 5 


    const groupByScore = (items:FatSong[]) => {
        const songs = items.map(it => mapSongToUIItem(it.song, it.album, it.artist))
        const retv:Record<number, SongUIItem[]|undefined> = {}  
        for (const song of songs) {
            const score = song.score
            if (!retv[score]) {
                retv[score] = [] 
            } 
            retv[score].push(song) 
        }
        return retv
    }    
    const ratedItems = items.filter(it => !!(it.song.score)) 
    const itemsByScore = groupByScore(ratedItems) 


    return <div id="grid-rater">
            {/* Rows with headers */}
            {Array.from({ length: totalItems }, (_, i) => {
                const row = Math.floor(i/itemsPerRow) 
                const isFirstRow = i % itemsPerRow === 0 
                return <GridRaterBlock rowRef={isFirstRow?rowRefs[row]: undefined} rowIndex={row} isFirstInRow={isFirstRow} key={`cell-${99 - i}`} 
                number={99-i} 
                items={itemsByScore[99-i]} 
                />
            })}
    </div>
}