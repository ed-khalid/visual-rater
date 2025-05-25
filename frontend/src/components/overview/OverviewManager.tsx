import { useMusicStateAndDispatch } from "../../hooks/MusicStateHooks"
import { ArtistOverview } from "./ArtistOverview"

interface Props {
    item: { id: string, type: 'artist'|'album'}
}

type OverviewLink = {
    id: string
    type: 'artist'|'album'
    parentId: string 
} 

export const OverviewManager = ({item}: Props) => {
    const { state, dispatch } = useMusicStateAndDispatch() 

    const artist = state.data.artists.find(it => it.id === item.id)  
    if (!artist) return null

    const onLinkClick = (link:OverviewLink) => {
    }

    return <div id="overview">
        <ArtistOverview artist={artist} />
    </div>

}