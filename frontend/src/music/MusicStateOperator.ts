import { Artist, Album, Song } from "../generated/graphql"
import { ContextArtist, FatSong } from "../models/CoreModels"
import { MusicData } from "./MusicData"
import { MusicFilter, MusicFilters } from "./MusicFilters"
import { MusicState } from "./MusicState"


export class MusicStateOperator {
  public data:MusicData;  
  public raterFilters:MusicFilters 
  public navigationFilters:MusicFilter[]
     
  constructor(state:MusicState) {
    this.data = state.data
    this.raterFilters = new MusicFilters(state.raterFilters) 
    this.navigationFilters = state.navigationFilters
  }

  public getAllArtists(): Artist[] {
    return this.data.artists
  }

  public getArtistForAlbum({albumId}:{albumId: string}): Artist|undefined {
    const album = this.data.albums.find(it => it.id === albumId)
    return this.data.artists.find(it => it.id === album?.artistId)
  } 

  public getAlbumsForArtist({id}:{id:string}) :Album[] {
    return this.data.albums.filter(it => it.artistId === id)
  }

  public getSongsForAlbum({id}:{id:string}): Song[] {
    return this.data.songs.filter(it => it.album.id === id)
  }

  public getContextArtists(): ContextArtist[] {
    return []
    // const artists = this.raterFilters.filterArtists(this.data.artists)
    // return artists.map(it => {
    //   const albums = this.getAlbumsForArtist(it)
    //   return {
    //     artist: 

    //   }

    // })
  }  

  
  public getSongById = (id:String) => this.data.songs.find(it => it.id === id)  
  public getArtistById = (id:String) => this.data.artists.find(it => it.id === id)  
  public getAlbumById = (id:String) => this.data.albums.find(it => it.id === id)  

  public getFatSongs() : FatSong[] {
    const songs = this.data.songs  
    if (this.raterFilters.hideAllSongs()) {
      return []
    }
    const artistFilteredSongs = this.raterFilters.filterSongsByArtist(songs)
    const albumFilteredSongs = this.raterFilters.filterSongsByAlbum(artistFilteredSongs) 
    const songFilteredSongs = this.raterFilters.filterSongs(albumFilteredSongs)
    return songFilteredSongs.map(song => (
      {
        artist: this.getArtistById(song.artist.id)!!,
        album: this.getAlbumById(song.album.id)!!, 
        song: song
      } 
    ))
  } 


}