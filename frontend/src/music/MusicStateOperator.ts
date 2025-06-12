import { Song } from "../generated/graphql";
import { MusicData } from "./MusicData"
import { NavigationFilter, RaterFilter } from "./MusicFilterModels"
import { MusicState } from "./MusicState"


export class MusicStateOperator {
  public data:MusicData;  
  public raterFilters:RaterFilter[] 
  public navigationFilters:NavigationFilter[]
     
  constructor(state:MusicState) {
    this.data = state.data
    this.raterFilters = state.raterFilters
    this.navigationFilters = state.navigationFilters
  }

  public getArtistById = (id:String) => this.data.artists.find(it => it.id === id)  
  public getAlbumById = (id:String) => this.data.albums.find(it => it.id === id)  

  public getSongs() : Song[] {
    const albumIds = this.raterFilters.flatMap(it => it.albums.map(it => it.albumId))
    const songs = this.data.songs.filter(it => albumIds.includes(it.album.id))
    return songs
  } 


}