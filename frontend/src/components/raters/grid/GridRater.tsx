import { useState } from "react"
import { SongUIItem } from "../../../models/CoreModels"
import './GridRater.css'
import { mapSongToUIItem } from "../../../functions/mapper"
import { GridRaterBlock } from "./GridRaterBlock"
import { Song } from "../../../generated/graphql"
import { DndContext, DragOverlay, DragStartEvent } from "@dnd-kit/core"
import { DraggableItem } from "../../../models/DragModels"

interface Props {
    onScoreUpdate: (song:Song) => void  
}

export const GridRater = ({onScoreUpdate}:Props) => {

    const [draggedItem, setDraggedItem] = useState<DraggableItem|undefined>(undefined)

    const handleDragStart = (event:DragStartEvent) => {
        const id = event.active.data.current?.id
        if (id) {
            const dataItem:Song|undefined = data?.songs?.content.find(it => it.id === id) 
            if (dataItem) {
            setDraggedItem({ type:'song', id: dataItem.id, name: dataItem.number + '. ' + dataItem.name, thumbnail: dataItem.album.thumbnail!  })
            }
        }
    } 

        const handleDragEnd =(event:any) => {
            const songId = event.active.data.current.id  
            const dataItem:Song|undefined = data?.songs?.content.find(it => it.id === songId) 
            if (dataItem) {
                const albumId = dataItem.album.id 
                const score = event.over.data.current.score  
                onScoreUpdate(dataItem) 
                // refetchQueries: [{ query: GetAlbumsSongsDocument, variables: { albumIds: [albumId] }  }]
                }
        }

    const groupByScore = (items:Song[]) => {
        const songs = items.map(it => mapSongToUIItem(it, it.album, it.artist))
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
    const ratedItems = items.filter(it => !!(it.score)) 
    const itemsByScore = groupByScore(ratedItems) 


    return <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <DragOverlay>
            { draggedItem && 
              <div className="dragged-item">
                  <img className="dragged-item-thumbnail" src={draggedItem.thumbnail!} />
                  <div className="dragged-item-text">{draggedItem.name}</div>
              </div>
            }
          </DragOverlay>
    <div id="grid-rater">
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
    </DndContext>
}