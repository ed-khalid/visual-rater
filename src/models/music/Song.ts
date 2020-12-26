import { AlbumInput, ArtistInput, Song } from "../../generated/graphql";

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type NewSong = Omit<Song, "id"|"score"|"album"|"artist"|"__typename">  & { artist:ArtistInput , album?:AlbumInput }
export type FullSong = Song & { album?: AlbumInput, artist:ArtistInput }  

