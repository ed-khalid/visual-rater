import { mapArtistToRatedItem, mapAlbumToRatedItem, mapSongToRatedItem } from "../functions/mapper"
import { Artist, Album, Song } from "../generated/graphql"
import { RatedMusicItemUI, RatedSongItemUI } from "../models/ui/ItemTypes"
import { RaterOrientation } from "../models/ui/RaterTypes"
import { MusicData } from "./MusicData"
import { MusicFilters } from "./MusicFilters"
import { MusicScope, MusicState } from "./MusicState"


const switchOrientation = (orientation: RaterOrientation) => {
  return orientation === RaterOrientation.LEFT ? RaterOrientation.RIGHT : RaterOrientation.LEFT
}

export const createMusicStore = (state:MusicState) => {

}

export class MusicStore {
  public filters:MusicFilters;  
  public data:MusicData;  
     
  constructor(state:MusicState) {
    this.data = state.data
    this.filters = new MusicFilters(state.filters)
  }

  public getSelectedArtists(): Artist[] {
    return this.filters.filterArtists(this.data.artists)
  }  
  public getSelectedAlbums(): Album[] {
    return this.filters.filterAlbums(this.data.albums)
  }  

  public getArtistForAlbum(album:Album): Artist|undefined {
    return this.data.artists.find(it => it.id === album.artistId)
  } 

  public getAlbumsForArtist(artistId:string) :Album[] {
    return this.data.albums.filter(it => it.artistId === artistId)
  }

  public hasArtistLoadedAlbums(artist:Artist) : boolean {
    return this.data.albums.filter(it => it.artistId === artist.id).length !== 0 
  }
  

  public hasNoFilters(): boolean {
    return this.filters.areEmpty()
  }
  public filterArtistsByScore = () => this.filters.filterByScore<Artist>(this.data.artists)
  public filterAlbumsByScore = () => this.filters.filterByScore<Album>(this.data.albums)
  public filterSongsByScore = () => this.filters.filterByScore<Song>(this.data.songs)


  // scope means what we're looking at right now  
  public getScope() : MusicScope  {
    // no filters, very top just artists
    if (this.filters.areEmpty()) {
      return MusicScope.ARTIST
    } 
    // we're looking at artists albums
    else if (this.filters.onlyArtists()) {
      return MusicScope.ALBUM
    }
    else if (this.filters.onlyArtistsAndAlbums()) {
      return MusicScope.SONG;
    // artists/songs without albums (i.e if filtering by score)  
    } else if (this.filters.onlyArtistsAndSongs()) {
      return MusicScope.SONG;
    // just get to the lower level
    } else {
      return MusicScope.SONG
    }
  }


  public getSongs() {
    let items:RatedSongItemUI[] = []
    if (this.getScope() === MusicScope.SONG) {
        const filteredByArtists = this.filters.filterSongsByArtist(this.data.songs)
        const filteredSongs = this.filters.filterSongsByAlbum(filteredByArtists)
        return filteredSongs.map(song => {
            const album = this.data.albums.find(it => it.id === song.albumId) 
            const artist = this.data.artists.find(it => it.id === song.artistId) 
            return mapSongToRatedItem(song,album!, artist!)
        })
    }
    return items;
  }  


  public getItems() {
    let whichOrientation = RaterOrientation.LEFT
    let items:RatedMusicItemUI[] = [];
    if (this.filters.areEmpty()) {
      items = this.data.artists.map(it => {
        whichOrientation = switchOrientation(whichOrientation)
        return mapArtistToRatedItem(it, whichOrientation)
      })
    }
    else if (this.filters.onlyArtists()) {
      items = this.filters.filterAlbumsByArtist(this.data.albums).map(it => {
        whichOrientation = switchOrientation(whichOrientation)
        return mapAlbumToRatedItem(it, whichOrientation)
      })
    }
    else if (this.filters.onlyArtistsAndAlbums()) {
      items = this.filters.filterSongsByAlbum(this.data.songs)
        .map(song => {
          whichOrientation = switchOrientation(whichOrientation)
          const album = this.data.albums.find(it => it.id === song.albumId)
          const artist = this.data.artists.find(it => it.id === song.artistId) 
          if (album && artist) {
            return mapSongToRatedItem(song, album, artist, whichOrientation)
          } else {
            throw Error(`cannot find album for song ${song}`)
          }
        })
    }
    else if (this.filters.onlyArtistsAndSongs()) {
      items = this.filters.filterSongsByArtist(this.data.songs)
        .map(song => {
          whichOrientation = switchOrientation(whichOrientation)
          const album = this.data.albums.find(it => it.id === song.albumId)
          const artist = this.data.artists.find(it => it.id === song.artistId) 
          if (album && artist) {
            return mapSongToRatedItem(song, album, artist, whichOrientation)
          } else {
            throw Error(`cannot find album for song ${song}`)
          }
        })
    }
      return items
  }
}