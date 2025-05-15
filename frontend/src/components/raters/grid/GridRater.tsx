import React from "react"
import { SongUIItem } from "../../../models/ItemTypes"
import './GridRater.css'
import { FatSong } from "../../../models/RaterTypes"
import { mapSongToUIItem } from "../../../functions/mapper"
import { DndContext } from  "@dnd-kit/core"
import { GridRaterBlock } from "./GridRaterBlock"
import { GetAlbumsSongsDocument, useUpdateSongMutation } from "../../../generated/graphql"

interface Props {
    items: FatSong[] 
}

export const GridRater = ({items}:Props) => {

    const [updateSong]  = useUpdateSongMutation();

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
    const itemsByScore = groupByScore(items) 

    const scoreFromRowAndCol = (rowIndex: number, colIndex: number) => 99 - (rowIndex * 10 + colIndex) ;

    const rowHeaders = {
        90 : 'BEST',
        80 : 'GOOD',
        70 : 'DECENT',
        60 : 'OK',
        50: 'AVERAGE',
        40: 'BORING',
        30: 'POOR',
        20: 'BAD',
        10: 'AWFUL',
        0: 'OFFENSIVE'
    }    

    const handleDrag =(event:any) => {
        const songId = event.active.data.current.item.id  
        const albumId = event.active.data.current.item.albumId  
        const score = event.over.data.current.score  
        updateSong({ variables: {song:  { id: songId , score} }, refetchQueries: [{ query: GetAlbumsSongsDocument, variables: { albumIds: [albumId] }  }]})
    }

    return <DndContext onDragEnd={handleDrag}>
    <div id="grid-rater">

            {/* Rows with headers */}
            {Array.from({ length: 10 }, (_, rowIndex) => (
                <React.Fragment key={`row-${9 - rowIndex}`}>
                    <div className="grid-rater-row-header" key={`row-header-${90 - rowIndex * 10}`}>
                        <div className="grid-rater-row-header-text">
                           {rowHeaders[90 - rowIndex * 10]}
                        </div>
                    </div>
                    {Array.from({ length: 10 }, (_, colIndex) => (
                        <GridRaterBlock key={`cell-${90 - rowIndex * 10}-${colIndex}`} number={scoreFromRowAndCol(rowIndex, colIndex)} items={itemsByScore[scoreFromRowAndCol(rowIndex, colIndex)]} />
                    ))}
                </React.Fragment>
            ))}
    </div>
    </DndContext>
}