import { Artist, Album, Song } from "../generated/graphql"
import { ArtistNavigationFilter } from "../models/ArtistNavigationFilter"
import { FatSong } from "../models/RaterTypes"
import { MusicData } from "./MusicData"
import { MusicFilters } from "./MusicFilters"
import { MusicState } from "./MusicState"


export class MusicStore {
  public data:MusicData;  
  public raterFilters:MusicFilters 
  public navigationFilters:ArtistNavigationFilter[]
     
  constructor(state:MusicState) {
    this.data = state.data
    this.raterFilters = new MusicFilters(state.raterFilters) 
    this.navigationFilters = state.navigationFilters
  }

  public getAllArtists(): Artist[] {
    return this.data.artists
  }

  public getArtistForAlbum(album:Album): Artist|undefined {
    return this.data.artists.find(it => it.id === album.artistId)
  } 

  public getAlbumsForArtist(artist:Artist) :Album[] {
    return this.data.albums.filter(it => it.artistId === artist.id)
  }

  public getSongsForAlbum(album:Album): Song[] {
    return this.data.songs.filter(it => it.albumId === album.id)
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
    const scoreFilteredSongs = this.raterFilters.filterByScore(songFilteredSongs)    
    return scoreFilteredSongs.map(song => (
      {
        artist: this.getArtistById(song.artistId)!!,
        album: this.getAlbumById(song.albumId)!!, 
        song: song
      } 
    ))
  } 


}