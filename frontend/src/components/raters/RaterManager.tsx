import { useState } from "react"
import './RaterManager.css'
import { GridRater } from "./grid/GridRater"
import { GetAlbumsSongsDocument, Song, useGetSongsPageQuery, useUpdateSongMutation } from "../../generated/graphql"
import { DndContext, DragOverlay, DragStartEvent } from "@dnd-kit/core"
import { RaterStyle } from "../../models/RaterModels"
import { DraggableItem } from "../../models/DragModels"
import { PlaylistRater } from "./playlist/PlaylistRater"
import { useMusicState } from "../../hooks/MusicStateHooks"

// type RaterProps = {
//     rowRefs: RefObject<HTMLDivElement>[] 
// } 

interface Props {
    raterStyle:RaterStyle
    totalRows: number
}

export const RaterManager = ({raterStyle, totalRows}:Props) => {

    const musicState = useMusicState() 
    const filters = musicState.playlistFilters

    const { data, loading, error } = useGetSongsPageQuery({ variables: { input:  filters}})  

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
            <div id="rater-content">
              {data?.songs.content && 
                (raterStyle=== RaterStyle.GRID) ?  <GridRater rowRefs={[]} items={data?.songs.content}  /> :
                (raterStyle=== RaterStyle.PLAYLIST) ? <PlaylistRater unratedItems={[]} onScoreUpdate={onScoreUpdate} /> :
                <></>
              }
            </div>
        </div> 
    </DndContext>
    
} 