import { RefObject } from "react"
import { useState } from "react"
import './RaterManager.css'
import { FatSong } from "../../models/RaterTypes"
import { RaterStyle } from "../../App"
import { GridRater } from "./grid/GridRater"
import { BlockRater } from "./block/BlockRater"
import { UnratedRaterPanel } from "./UnratedRaterPanel"
import { GetAlbumsSongsDocument, useUpdateSongMutation } from "../../generated/graphql"
import { DndContext, DragOverlay, DragStartEvent } from "@dnd-kit/core"
import { DraggableItem } from "../../pages/HomePage"
import { AnimatePresence } from "framer-motion"
import { Modal } from "../common/Modal"

// type RaterProps = {
//     rowRefs: RefObject<HTMLDivElement>[] 
// } 

interface Props {
    items:FatSong[]
    raterStyle:RaterStyle
    totalRows: number
}

export const RaterManager = ({items, raterStyle, totalRows}:Props) => {

    const ratedItems = items.filter(it => it.song.score)
    const unratedItems= items.filter(it => !(it.song.score))
    const [updateSong]  = useUpdateSongMutation();
    const [draggedItem, setDraggedItem] = useState<DraggableItem|undefined>(undefined)

    // const wrapperRef = useRef<HTMLDivElement|null>(null)
    // const [visibleRows, setVisibleRows] = useState<Set<number>>(new Set()) 

    // const rowRefs = useRef<RefObject<HTMLDivElement>[]>(
    //     Array.from({length: totalRows}, () => createRef<HTMLDivElement>())
    // ) 

    // useEffect(() => {
    //     if (!wrapperRef.current) {
    //         return
    //     }
    //     const observer = new IntersectionObserver(
    //         (entries) => {
    //             const newVisibleRows = new Set<number>()
    //             entries.forEach((entry) => {
    //                 const row = parseInt(entry.target.getAttribute('data-row') || '-1', 10) 
    //                 if (entry.isIntersecting) newVisibleRows.add(row)
    //             })
    //         setVisibleRows(newVisibleRows)
    //         },
    //         {
    //             root: wrapperRef.current,
    //             threshold: 0.5
    //         }
    //     )
    //     rowRefs.current.forEach((ref) => {
    //         if (ref.current) observer.observe(ref.current)
    //     })
    // return () => {
    //     observer.disconnect()
    // }

    // }, [])

    // const scrollToRow = (rowIndex:number) => {
    //     const el = rowRefs.current[rowIndex]?.current 
    //     if (el) {
    //         el.scrollIntoView({ behavior: 'smooth', block: 'start'})
    //     }
    // }
    // const min = visibleRows.size ? Math.min(...visibleRows) : 0 
    // const max = visibleRows.size ? Math.max(...visibleRows) : totalRows - 1
    // console.log('visibleRows', visibleRows)

  const handleDragStart = (event:DragStartEvent) => {
    const id = event.active.data.current?.id
    if (id) {
        const dataItem:FatSong|undefined = items.find(it => it.song.id === id) 
        if (dataItem) {
          setDraggedItem({ id: dataItem.song.id, name: dataItem.song.number + '. ' + dataItem.song.name, thumbnail: dataItem.album.thumbnail!  })
        }
    }
  } 

    const handleDragEnd =(event:any) => {
        const songId = event.active.data.current.id  
        const dataItem:FatSong|undefined = items.find(it => it.song.id === songId) 
        if (dataItem) {
            const albumId = dataItem.song.albumId 
            const score = event.over.data.current.score  
            updateSong({ variables: {song:  { id: songId , score} }, refetchQueries: [{ query: GetAlbumsSongsDocument, variables: { albumIds: [albumId] }  }]})
        }
    }


    return <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <DragOverlay>
            { draggedItem && 
              <div className="dragged-item">
                  <img className="dragged-item-thumbnail" src={draggedItem.thumbnail!} />
                  <div className="dragged-item-text">{draggedItem.name}</div>
              </div>
            }
          </DragOverlay>
        <div id="rater-wrapper">
            {(unratedItems.length > 0) && <UnratedRaterPanel items={unratedItems} />}
            <div id="rater-content">
                {(raterStyle=== RaterStyle.GRID) && <GridRater rowRefs={[]} items={ratedItems}  />}
                {(raterStyle=== RaterStyle.LIST) && <BlockRater items={ratedItems}  rowRefs={[]} />}
            </div>
            {/* {(raterStyle=== RaterStyle.CARTESIAN) && <CartesianRater />} */}
        </div> 
    </DndContext>
    
} 