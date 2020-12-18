import { SearchResult, TrackSearchResult } from "../../generated/graphql";
import { Song, Artist, Album } from "../music";


export const ItemMapper = {

    convert : (tracks:Array<TrackSearchResult>, albumGql:SearchResult, artistGql:SearchResult) => {

        const artist = new Artist(artistGql.id, artistGql.name)
        const album = new Album(albumGql.id, albumGql.name, artist)
        return tracks.map(track => new Song(track.id, track.number, track.name, artist, album) )
    }

} 