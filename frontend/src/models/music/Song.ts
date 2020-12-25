import { AlbumInput, ArtistInput, Song } from "../../generated/graphql";

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type NewSong = Optional<Song, "id"|"score"|"album"|"__typename"> & { album?: AlbumInput, artist:ArtistInput }     
export type FullSong = Song & { album?: AlbumInput, artist:ArtistInput }  