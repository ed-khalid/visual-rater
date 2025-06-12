import { useState } from "react"
import './RaterManager.css'
import { GridRater } from "./grid/GridRater"
import { BlockRater } from "./block/BlockRater"
import { UnratedRaterPanel } from "./UnratedRaterPanel"
import { GetAlbumsSongsDocument, Song, useUpdateSongMutation } from "../../generated/graphql"
import { DndContext, DragOverlay, DragStartEvent } from "@dnd-kit/core"
import { RaterStyle } from "../../models/RaterModels"
import { DraggableItem } from "../../models/DragModels"
import { LinearRater } from "./linear/LinearRater"
import { RaterContext } from "./context/RaterContext"
import { PlaylistRater } from "./playlist/PlaylistRater"

// type RaterProps = {
//     rowRefs: RefObject<HTMLDivElement>[] 
// } 

interface Props {
    items:Song[]
    raterStyle:RaterStyle
    totalRows: number
}

export const RaterManager = ({items, raterStyle, totalRows}:Props) => {

    const ratedItems = items.filter(it => it.score)
    const unratedItems= items.filter(it => !(it.score))
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

  const onScoreUpdate = (updatedSong:Song) => {
    updateSong({ variables: { song: { id: updatedSong.id, score: updatedSong.score  } }})
  } 


  const handleDragStart = (event:DragStartEvent) => {
    const id = event.active.data.current?.id
    if (id) {
        const dataItem:Song|undefined = items.find(it => it.id === id) 
        if (dataItem) {
          setDraggedItem({ type:'song', id: dataItem.id, name: dataItem.number + '. ' + dataItem.name, thumbnail: dataItem.album.thumbnail!  })
        }
    }
  } 

    const handleDragEnd =(event:any) => {
        const songId = event.active.data.current.id  
        const dataItem:Song|undefined = items.find(it => it.id === songId) 
        if (dataItem) {
            const albumId = dataItem.album.id 
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
            <RaterContext />
            {(raterStyle !== RaterStyle.LINEAR) && (unratedItems.length > 0) && <UnratedRaterPanel items={unratedItems} />}
            <div id="rater-content">
                {(raterStyle=== RaterStyle.GRID) && <GridRater rowRefs={[]} items={ratedItems}  />}
                {(raterStyle=== RaterStyle.LIST) && <BlockRater items={ratedItems}  rowRefs={[]} />}
                {(raterStyle=== RaterStyle.LINEAR) && <LinearRater items={items} onScoreUpdate={onScoreUpdate}  rowRefs={[]} />}
                {(raterStyle=== RaterStyle.PLAYLIST) && <PlaylistRater items={items} onScoreUpdate={onScoreUpdate} />}
            </div>
            {/* {(raterStyle=== RaterStyle.CARTESIAN) && <CartesianRater />} */}
        </div> 
    </DndContext>
    
} 