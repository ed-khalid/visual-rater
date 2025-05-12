import { Album, Artist, Song } from "../../generated/graphql"
import { ArtistDetails } from "./ArtistDetails"
import { NavScoreInfo } from "./NavScoreInfo"

interface Props {
    entityType: 'artist' | 'album' | 'song'
    data: (Artist|Album|Song)[] 
    thumbnailUrl?:string
    onAction?:any 
    onSelect?:any
}

export const NavPanel = ({entityType, data, onAction, onSelect, thumbnailUrl }: Props) => {

    switch(entityType) {
        case "album":
        const albums = data as Album[]
    return <ul id={`${entityType}-nav-list`}>
        {albums.map(item => 
          <li key={`${entityType}-nav-item-${item.id}`}>
            <div className="nav-panel-expandable-item">
                {onAction && <div className={`${entityType}-controls`} onClick={() => onAction(item)}>
                    +
                </div> }
                <img className="nav-panel-item-thumbnail" src={item.thumbnail!} />
                <div className="nav-item-info">
                    <div onClick={() => onSelect(item)} className="nav-item-info-name">{item.name} </div>
                </div>
                <NavScoreInfo item={item} type="album" />
            </div> 
          </li> 
        )}
    </ul>
    case "song":
        const songs = data as Song[]
        return <ul id={`${entityType}-nav-list`}>
            {data.map(item => 
            <li key={`${entityType}-nav-item-${item.id}`}>
                <div className="nav-panel-expandable-item">
                    {thumbnailUrl && <img src={thumbnailUrl} />}
                    <div className="nav-item-info">
                        <div onClick={() => onSelect(item)} className="nav-item-info-name">{item.name} </div>
                    </div>
                    <NavScoreInfo item={item} type={entityType} />
                </div> 
            </li> 
            )}
        </ul>



    }

    
    



    
} 