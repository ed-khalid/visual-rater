import { useEffect, useState } from "react"
import { useMusicStateAndDispatch } from "../../../hooks/MusicStateHooks"
import './RaterContext.css'
import { RaterContextEntry } from "./RaterContextEntry"
import { RaterContextEntryModel } from "../../../models/RaterModels"
import { FilterMode } from "../../../music/MusicFilters"

interface Props {

}

type ArtistRaterContextEntryModel = RaterContextEntryModel & { albums: RaterContextEntryModel[]}

export const RaterContext = ({}:Props) => {
    const { dispatch, state } = useMusicStateAndDispatch()

    const [entries, setEntries] = useState<ArtistRaterContextEntryModel[]>([])  


    const handleOnDelete = (entry:RaterContextEntryModel) => {

    }  
    const handleOnToggle = (entry:RaterContextEntryModel) => {
        if (entry.type === 'album') {
        dispatch({ type: 'RATER_FILTER_CHANGE', filters: { albumIds: [entry.id] }, mode: FilterMode.REDUCTIVE  })
        }
        if (entry.type === 'artist') {
        dispatch({ type: 'RATER_FILTER_CHANGE', filters: { artistIds: [entry.id] }, mode: FilterMode.REDUCTIVE  })
        }
    }  
    useEffect(() => {
    const artistIds = state.raterFilters.artistIds
    const albumIds = state.raterFilters.albumIds
    const artistEntries  = artistIds.map(id => {
        const artist = state.data.artists.find(it => it.id === id)  
        if (!artist) throw "RaterContext: Artist NOT FOUND in data"
        const albums = state.data.albums.filter(it => it.artistId === id && albumIds.includes(it.id)) 
        const albumEntries = albums.map<RaterContextEntryModel>((album) => ({ id: album.id, name: album.name, thumbnail: album.thumbnail, isHidden: false, type: 'album', parentId: album.artistId })) 
        const artistEntry:ArtistRaterContextEntryModel = {
            id: artist.id,
            name: artist.name,
            thumbnail: artist.thumbnail,
            isHidden: false,
            type: 'artist',
            albums: albumEntries,
            parentId: null
        } 
        return artistEntry
    })
    setEntries(artistEntries)
    }, [state])


    return <div id="rater-context">
        {entries.map(entry => 
        <div key={`rater-context-entry-${entry.id}`} className="rater-context-entry-wrapper">
            <RaterContextEntry entry={entry} onDelete={handleOnDelete} onToggle={handleOnToggle} />
                <div className="albums">
                        {entry.albums.map(album => 
                        <RaterContextEntry  entry={album} onDelete={handleOnDelete} onToggle={handleOnToggle} />
                        )}
            </div>
        </div> )}
    </div> 

}