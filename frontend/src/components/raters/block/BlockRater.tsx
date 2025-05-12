import { mapSongToUIItem } from "../../../functions/mapper";
import { GetAlbumsSongsDocument, useUpdateSongMutation } from "../../../generated/graphql";
import { SongUIItem } from "../../../models/ItemTypes";
import { ArtistRaterItems } from "../../../models/RaterTypes"
import { DndContext } from "@dnd-kit/core";
import './BlockRater.css'
import { BlockRaterRow } from "./BlockRaterRow";

interface Props {
    items: ArtistRaterItems[]


}

export const BlockRater = ({items}:Props) => {


    const [updateSong]  = useUpdateSongMutation();

    const groupByScore = (items:ArtistRaterItems[]) => {
        const songs = items.flatMap(it =>  {
            const songs = it.songs.map(song => 
                mapSongToUIItem(song, it.albums.find(it => it.id === song.albumId)!!, it.artist)
            )  
             return songs
         })
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
    const itemsByScore = groupByScore(items) 

    const handleDrag =(event:any) => {
        const songId = event.active.data.current.item.id  
        const albumId = event.active.data.current.item.albumId  
        const score = event.over.data.current.score  
        updateSong({ variables: {song:  { id: songId , score} }, refetchQueries: [{ query: GetAlbumsSongsDocument, variables: { albumIds: [albumId] }  }]})
    }

    return <DndContext onDragEnd={handleDrag}>
        <div id="block-rater">
                {Array.from({ length: 100 }, (_, index) => (
                    <BlockRaterRow key={index} index={index} items={itemsByScore[99-index]} /> 
                ))}
        </div>
    </DndContext>
}
