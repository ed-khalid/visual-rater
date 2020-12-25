import { Album, AlbumSearchResult, Artist, ArtistSearchResult, NewSongInput, Song } from "../generated/graphql";

export const mapper = {

    searchResultToResult:<T extends Album|Artist>(searchResult:AlbumSearchResult|ArtistSearchResult) : T   => {
        return {
            vendorId: searchResult.id
            ,name: searchResult.name
            ,thumbnail: searchResult.images[2].url
        } as T
    } 
} 