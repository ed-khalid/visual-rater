import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragOverlay } from "@dnd-kit/core"
import { arrayMove, SortableContext, verticalListSortingStrategy }  from '@dnd-kit/sortable'
import { Song } from "../../../generated/graphql"
import './PlaylistRater.css'
import { PlaylistItem } from "./PlaylistItem"
import { useEffect, useRef, useState } from "react"
import { useMusicState } from "../../../hooks/MusicStateHooks"
import { useGetSongsForPlaylistRater } from "../../../hooks/DataLoadingHooks"

interface Props {
    onScoreUpdate: (updatedSong: Song) => void 
}

export const PlaylistRater = ({onScoreUpdate}: Props) => {


    const musicState = useMusicState() 
    const [items, setItems] = useState<Song[]>([])
    const filters = {...musicState.songFilters, ...musicState.playlistFilters} 

    const $songsPage = useGetSongsForPlaylistRater(filters) 
    const observerRef = useRef<HTMLDivElement>(null) 

    useEffect(() => {
        if (!$songsPage.loading && $songsPage.data?.songs?.content) {
          setItems($songsPage.data.songs.content)
        }

    }, [$songsPage.loading, $songsPage.data?.songs.content])
    useEffect(() => {  
        const scrollParent = document.getElementById("rater-content") 
        const target = observerRef.current 
        if (!scrollParent || !target) return
        const observer = new IntersectionObserver((entries) => {
            const first = entries[0]
            if (first.isIntersecting && !$songsPage.loading && ($songsPage.data?.songs.pageNumber !== undefined) && $songsPage.data?.songs.pageNumber < $songsPage.data?.songs.totalPages-1) {
                $songsPage.fetchMore({
                    variables: { 
                        input: {
                            ...musicState.playlistFilters,
                            pageNumber: $songsPage.data.songs.pageNumber + 1
                        }
                    }
                    , updateQuery: (prev, { fetchMoreResult }) => {
                        if (!fetchMoreResult || !fetchMoreResult.songs) return prev
                        const newSongs = fetchMoreResult.songs.content || []
                        const mergedSongs = [...prev.songs.content, ...newSongs]
                        return {
                            ...prev,
                            songs: {
                                ...prev.songs,
                                content: mergedSongs,
                                pageNumber: fetchMoreResult.songs.pageNumber,
                                totalPages: fetchMoreResult.songs.totalPages
                            }
                        }
                    }
                 })
            }
        }, { root: scrollParent, threshold: 0.8 } )
        const current = observerRef.current 
        if (current) observer.observe(current) 
        return () => {
            if (current) observer.unobserve(current)
        }
     }, [$songsPage.loading, $songsPage.data, $songsPage.fetchMore])

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint:  { distance: 2 } }))
    const [draggedSong, setDraggedSong] = useState<Song|null>(null)

    const handleIncrementalUpdate = (updatedSong: Song) => {
        onScoreUpdate(updatedSong)
    }

    const handleDragStart = (event:any) => {
        setDraggedSong(event.active.data.current)
    }
    const handleDragEnd = (event:any) => {
        const {active, over} = event
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex(it => it.id === active.id)
            const newIndex = items.findIndex(it => it.id === over.id)
            const itemBefore = (newIndex == 0) ? null : items[newIndex-1]    
            const itemAfter = (newIndex == items.length -1) ? null : items[newIndex]    
            let newScore = event.active.data.current.score  
            if (itemBefore && itemAfter) {
                const diff = itemBefore.score! - itemAfter.score!  
                if (diff === 0) {
                    newScore = itemAfter.score! + 0.01
                    itemBefore.score = itemBefore.score! + 0.02   
                    onScoreUpdate(itemBefore)
                    onScoreUpdate({...items[oldIndex], score: newScore})
                } else if (diff < 1) {
                    const increment = diff/2 
                    newScore = itemAfter.score! + increment
                    onScoreUpdate({...items[oldIndex], score: newScore})
                } else if (diff < 2)  { 
                    newScore = itemAfter.score! + 0.1
                    onScoreUpdate({...items[oldIndex], score: newScore})
                } else {
                    newScore = Math.floor((itemBefore.score! + itemAfter.score!) / 2)
                    onScoreUpdate({...items[oldIndex], score: newScore})
                }  
            } else if (itemBefore) {
                newScore = itemBefore.score! - 0.01 
                onScoreUpdate({...items[oldIndex], score: newScore})
            } else if (itemAfter)  {
                newScore = itemAfter.score! + 0.01 
                onScoreUpdate({...items[oldIndex], score: newScore})
            }
            const songs = arrayMove<Song>(items, oldIndex, newIndex)
            setItems(songs)
        }
        setDraggedSong(null)

    }
    const handleDragCancel = (event:any) => {
        setDraggedSong(null)
    }

    return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        <SortableContext items={items.map(it => it.id)} strategy={verticalListSortingStrategy}>
            <div id="playlist-rater">
                <ol>
                {items.map(item => 
                    <PlaylistItem onScoreUpdate={handleIncrementalUpdate} key={item.id} item={item} />
                )}
                </ol>
                </div>
                <div ref={observerRef} style={{height: '40px'}} className="observer">
                    {$songsPage.loading && <div className="loading">Loading...</div>}
                </div>
        </SortableContext>
        <DragOverlay>
            {draggedSong ?  <div className="dragged-item">{draggedSong.name}</div> : null}
        </DragOverlay>
    </DndContext>
}