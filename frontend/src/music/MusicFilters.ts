import { Album, Artist, Song } from "../generated/graphql"
import { MusicEntity, ScoreFilter } from "./MusicState"

export class MusicFilters {
  private artistIds: String[]
  private albumIds: String[]
  private songIds: String[]
  private scoreFilter: ScoreFilter
  private hideAll:boolean

  constructor(filtersObj: { hideAll:boolean, artistIds: String[], albumIds: String[], songIds: String[], scoreFilter: ScoreFilter }) {
    this.artistIds = filtersObj.artistIds
    this.albumIds = filtersObj.albumIds
    this.songIds = filtersObj.songIds
    this.scoreFilter = filtersObj.scoreFilter
    this.hideAll = filtersObj.hideAll
  }


  public filterByScore = <T extends MusicEntity> (arr: Array<T>) => arr.filter(it => ( this.scoreFilter && it.score) ? it.score >= this.scoreFilter.start && it.score <= this.scoreFilter.end : true)
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