import { mapSongToUIItem } from "../../../functions/mapper";
import { GetAlbumsSongsDocument, useUpdateSongMutation } from "../../../generated/graphql";
import { SongUIItem } from "../../../models/CoreModels";
import './BlockRater.css'
import { BlockRaterRow } from "./BlockRaterRow";
import { FatSong } from "../../../models/RaterModels";
import { RefObject } from "react";

interface Props {
    items: FatSong[]
    rowRefs: RefObject<HTMLDivElement>[] 
}

export type BlockRaterSongItem = SongUIItem & { rowIndex: number  }    

export const BlockRater = ({items, rowRefs}:Props) => {

    const uniqueAlbums = items.reduce<Record<string, boolean>>((acc,it) => {
        if (acc[it.album.id]) return acc 
        acc[it.album.id] = true
        return acc
     }, {})
     const albumIds = Object.keys(uniqueAlbums)


    const [updateSong]  = useUpdateSongMutation();

    const groupByScore = (fatSongs:FatSong[]) => {
        const songItems:BlockRaterSongItem[] = fatSongs.map(it =>  
                ({ ...mapSongToUIItem(it.song, it.album, it.artist), rowIndex: albumIds.indexOf(it.album.id) })
            )  
        const retv:Record<number, SongUIItem[]|undefined> = {}  
        for (const song of songItems) {
            const score = song.score
            if (!retv[score]) {
                retv[score] = [] 
            } 
            retv[score].push(song) 
        }
        return retv
    }    
    const itemsByScore = groupByScore(items) 

    const handleDrag =(event:any) => {
        const songId = event.active.data.current.item.id  
        const albumId = event.active.data.current.item.albumId  
        const score = event.over.data.current.score  
        updateSong({ variables: {song:  { id: songId , score} }, refetchQueries: [{ query: GetAlbumsSongsDocument, variables: { albumIds: [albumId] }  }]})
    }

    return <div id="block-rater">
                {Array.from({ length: 100 }, (_, index) => (
                    <BlockRaterRow key={index} index={index} items={itemsByScore[99-index]} /> 
                ))}
        </div>
}
