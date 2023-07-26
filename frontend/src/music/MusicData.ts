import { Album, Artist, Song } from "../generated/graphql"

export class MusicData {
  public artists: Artist[]
  public albums: Album[]
  public songs: Song[]
  constructor(musicObj: { artists: Artist[], albums: Album[], songs: Song[] }) {
    this.artists = musicObj.artists
    this.albums = musicObj.albums
    this.songs = musicObj.songs
  }
}