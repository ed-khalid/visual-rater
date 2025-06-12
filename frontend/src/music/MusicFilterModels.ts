import { Album, Song } from "../generated/graphql"

export type NavigationFilter = {
    artistId: string
    albumIds: string[]
}
export class RaterFilter {
  artistId: string
  albums: AlbumRaterFilter[]
  constructor(artistId:string, albums:AlbumRaterFilter[]) {
    this.artistId = artistId,
    this.albums = albums
  }
  public filterAlbums = (albums: Album[]) => albums.filter(it => this.albums.map(it=>it.albumId).includes(it.id))
  public getSongIds(): string[] {
    return this.albums.flatMap(it => it.songIds) 
  }  
}

export class AlbumRaterFilter {
  albumId: string
  songIds: string[]

  constructor(albumId:string, songIds: string[]) {
    this.albumId = albumId,
    this.songIds = songIds
  }

  public filterSongs = (songs: Song[]) => songs.filter(it => this.songIds.includes(it.id))

}

export enum FilterMode { ADDITIVE, EXCLUSIVE, REDUCTIVE }