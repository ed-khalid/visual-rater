import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragOverlay } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy }  from '@dnd-kit/sortable'
import { Song } from "../../../generated/graphql"
import './PlaylistRater.css'
import { PlaylistItem } from "./PlaylistItem"
import { useEffect, useRef, useState } from "react"
import { useMusicState } from "../../../hooks/MusicStateHooks"
import { useGetSongsForPlaylistRater } from "../../../hooks/DataLoadingHooks"
import { reorderAndRescore } from "../../../functions/playlistScoring"

interface Props {
    /** Resolves to false if the save failed. */
    onScoreUpdate: (updatedSong: Song) => Promise<boolean>
}

export const PlaylistRater = ({onScoreUpdate}: Props) => {


    const musicState = useMusicState() 
    const [items, setItems] = useState<Song[]>([])
    const filters = {...musicState.songFilters, ...musicState.playlistFilters} 

    const $songsPage = useGetSongsForPlaylistRater(filters) 
    const observerRef = useRef<HTMLDivElement>(null) 
    // Latest server data, read after async saves finish (the closure's copy would be stale).
    const latestContent = useRef<Song[] | undefined>(undefined)
    latestContent.current = $songsPage.data?.songs.content

    // Apollo keeps the cached page in its original fetch order, so a saved score would
    // otherwise snap the song back to where it was. Re-sort (stable) to match the scores.
    const serverItems = (content: Song[]) => [...content].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

    useEffect(() => {
        if (!$songsPage.loading && $songsPage.data?.songs?.content) {
          setItems(serverItems($songsPage.data.songs.content))
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
                            ...filters,
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
            const { items: reordered, updates } = reorderAndRescore(items, oldIndex, newIndex)
            setItems(reordered)
            Promise.all(updates.map(onScoreUpdate)).then(results => {
                // A save failed: go back to the scores the server actually has.
                // (Saves that succeeded are already in the Apollo cache, so they're kept.)
                const content = latestContent.current
                if (results.includes(false) && content) setItems(serverItems(content))
            })
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