import { AlbumInput, AlbumSearchResult, ArtistInput, ArtistSearchResult, Song } from "../../generated/graphql";

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type NewSong = Omit<Song, "score"|"album"|"artist"|"__typename">  & { artist:ArtistSearchResult , album?:AlbumSearchResult }
export type FullSong = Song & { album?: AlbumInput, artist:ArtistInput }  

