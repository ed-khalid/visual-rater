import React from "react"
import { SongUIItem } from "../../../models/ItemTypes"
import './GridRater.css'
import { FatSong } from "../../../models/RaterTypes"
import { mapSongToUIItem } from "../../../functions/mapper"
import { DndContext } from  "@dnd-kit/core"
import { GridRaterBlock } from "./GridRaterBlock"
import { GetAlbumsSongsDocument, useUpdateSongMutation } from "../../../generated/graphql"
import { GridRaterItemUI } from "./GridRaterItemUI"
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"

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
    const unratedItems = items.filter(it => !!!(it.song.score))  
    const ratedItems = items.filter(it => !!(it.song.score)) 
    const itemsByScore = groupByScore(ratedItems) 

    const scoreFromRowAndCol = (rowIndex: number, colIndex: number) => 99 - (rowIndex * 10 + colIndex) ;

    const handleDrag =(event:any) => {
        const songId = event.active.data.current.item.id  
        const albumId = event.active.data.current.item.albumId  
        const score = event.over.data.current.score  
        updateSong({ variables: {song:  { id: songId , score} }, refetchQueries: [{ query: GetAlbumsSongsDocument, variables: { albumIds: [albumId] }  }]})
    }

    return <DndContext onDragEnd={handleDrag}>
        <TransformWrapper>
            <TransformComponent>
    <div id="grid-rater">
            <div className="grid-rater-cell" id="grid-rater-unrated">
                <div className="grid-rater-cell-number">
                    UNRATED
                </div>
                {unratedItems.map((unratedItem) => <GridRaterItemUI isUnrated={true} key={"unrated-item-"+unratedItem.song.id} item={mapSongToUIItem(unratedItem.song, unratedItem.album, unratedItem.artist)} />)}
            </div>

            {/* Rows with headers */}
            {Array.from({ length: 10 }, (_, rowIndex) => (
                <React.Fragment key={`row-${9 - rowIndex}`}>
                    {Array.from({ length: 10 }, (_, colIndex) => (
                        <GridRaterBlock key={`cell-${90 - rowIndex * 10}-${colIndex}`} number={scoreFromRowAndCol(rowIndex, colIndex)} items={itemsByScore[scoreFromRowAndCol(rowIndex, colIndex)]} />
                    ))}
                </React.Fragment>
            ))}
    </div>
            </TransformComponent>
        </TransformWrapper>
    </DndContext>
}