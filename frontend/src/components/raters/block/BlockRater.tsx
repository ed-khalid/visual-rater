import { mapSongToUIItem } from "../../../functions/mapper";
import { GetAlbumsSongsDocument, Song, useUpdateSongMutation } from "../../../generated/graphql";
import { SongUIItem } from "../../../models/CoreModels";
import './BlockRater.css'
import { BlockRaterRow } from "./BlockRaterRow";
import { RefObject } from "react";

interface Props {
    items: Song[]
    rowRefs: RefObject<HTMLDivElement>[] 
}

export const BlockRater = ({items, rowRefs}:Props) => {

    const [updateSong]  = useUpdateSongMutation();

    const groupByScore = (songs:Song[]) => {
        const songItems = songs.map(it =>  
                ({ ...mapSongToUIItem(it, it.album, it.artist)})
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
