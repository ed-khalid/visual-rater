import { useEffect, useState } from "react"
import { Album, GetAlbumsSongsDocument, Maybe, Song, useGetUnratedAlbumsQuery, useUpdateSongMutation } from "../generated/graphql"
import { useMusicDispatch } from "../hooks/MusicStateHooks"
import { UnratedAlbumsNavigator } from "../components/unrated/unrated-navigator/UnratedAlbumsNavigator"
import { DndContext } from "@dnd-kit/core"
import { UnratedAlbumsMain } from "../components/unrated/UnratedAlbumsMain"

export type UnratedAlbum = {
    id: string
    name: string
    thumbnail?: Maybe<string>
    year: number
    score?: number
    artist: { id: string, name: string}
    songs: Song[]
}

interface Props {
}

export const UnratedPage = ({}:Props) => {

    const musicDispatch = useMusicDispatch()
    const [updateSong]  = useUpdateSongMutation();
    const [currentAlbum, setCurrentAlbum] = useState<UnratedAlbum | undefined>()

    const handleDrag = (event: any) => {
        const songId = event.active.data.current.item.id 
        const albumId = event.active.data.current.item.albumId 
        const score = event.over.data.current.score
        updateSong({ variables: {song:  { id: songId , score} }, refetchQueries: [{ query: GetAlbumsSongsDocument, variables: { albumIds: [albumId] }  }]})
    }

    const { data, loading, error } = useGetUnratedAlbumsQuery() 
    const [unratedAlbums, setUnratedAlbums] = useState<UnratedAlbum[]>([])  
    useEffect(() => {
        if (data && !loading) {
            setUnratedAlbums(data.unratedAlbums as UnratedAlbum[])
            const albums:Album[] = data.unratedAlbums.map((it) => ({artistId: it.artist!.id, dominantColor: undefined, genres: undefined,id: it.id, name: it.name, score: it.score, songs: [], thumbnail: it.thumbnail, year: it.year   }))
            const songs:Song[] = data.unratedAlbums.flatMap(it => it.songs)
            musicDispatch({ type: 'DATA_CHANGE', data: { albums, songs }})
        }
    }, [data, loading])


    return <DndContext onDragEnd={handleDrag} ><div id="sidebar">
        <UnratedAlbumsNavigator albums={unratedAlbums} onSelect={(album:UnratedAlbum) => setCurrentAlbum(album) } />
    </div>
    <div id="main">
        <UnratedAlbumsMain album={currentAlbum} />
    </div></DndContext>
}

