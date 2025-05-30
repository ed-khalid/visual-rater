import { Album, Artist, Song } from "../generated/graphql"

export type MusicFilter = {
    artistId: string
    albumIds: string[]
}
export class MusicFilters {
  private artistIds: String[]
  private albumIds: String[]
  private songIds: String[]
  private hideAll:boolean

  constructor(filtersObj: { hideAll:boolean, artistIds: String[], albumIds: String[], songIds: String[]}) {
    this.artistIds = filtersObj.artistIds
    this.albumIds = filtersObj.albumIds
    this.songIds = filtersObj.songIds
    this.hideAll = filtersObj.hideAll
  }


  private filterById = (id:string, arr:String[]) => (arr && arr.length) ? arr.includes(id) : true   
  public filterArtists = (artists: Artist[]) => artists.filter(it => this.filterById(it.id, this.artistIds))
  public filterAlbums = (albums: Album[]) => albums.filter(it => this.filterById(it.id, this.albumIds))
  public filterAlbumsByArtist = (albums: Album[]) => albums.filter(it => this.filterById(it.artistId, this.artistIds))
  public filterSongs = (songs: Song[]) => songs.filter(it => this.filterById(it.id, this.songIds))
  public filterSongsByAlbum = (songs: Song[]) => songs.filter(it => this.filterById(it.albumId, this.albumIds))
  public filterSongsByArtist = (songs: Song[]) => songs.filter(it => this.filterById(it.artistId,this.artistIds))
  public hideAllSongs = () => this.hideAll 

}

export enum FilterMode { ADDITIVE, EXCLUSIVE, REDUCTIVE }