import { mapAlbumToRaterUIItem, mapAlbumToUIItem, mapArtistToRaterUIItem, mapArtistToUIItem, mapSongToRaterUIItem, mapSongToUIItem } from "../functions/mapper"
import { Artist, Album, Song } from "../generated/graphql"
import { RaterUIItem } from "../models/domain/ItemTypes"
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
    else {
      return MusicScope.SONG
    }
  }

  public getItems() {
    switch(this.getScope()) {
      case MusicScope.ARTIST: {
        return this.data.artists.map(it => mapArtistToUIItem(it))
      }
      case MusicScope.ALBUM: {
        return this.filters.filterAlbumsByArtist(this.data.albums).map(it => mapAlbumToUIItem(it))
      }
      case MusicScope.SONG: {
        const filteredByArtists = this.filters.filterSongsByArtist(this.data.songs)
        const filteredSongs = this.filters.filterSongsByAlbum(filteredByArtists)
        return filteredSongs.map(song => {
            const album = this.data.albums.find(it => it.id === song.albumId) 
            const artist = this.data.artists.find(it => it.id === song.artistId) 
            return mapSongToUIItem(song,album!, artist!)
        })
      } 
    }
  }  

  /** 
   *  possible filter states: (ScoreFilter applies to all SONG cases (for now))
   *  artists [ ] albums [ ] songs [ ] = Scope.ARTIST, show ARTISTS 
   *  artists [x] albums [ ] songs [ ] = Scope.ALBUM,  show ALBUMS for ARTISTS
   *  artists [x] albums [x] songs [ ] = Scope.SONG, show SONGS for ARTISTS in ALBUMS     
   *  artists [x] albums [ ] songs [x] = Scope.SONG, shows SONGS for ARTISTS 
   *  artists [x] albums [x] songs [x] = Scope.SONG, shows SONGS  for ARTTIST in ALBUMS, as well as SONGS which could come from other sources
   *  artists [ ] albums [x] songs [x] = Scope.SONG, show all SONGS from ALBUMS as well as SONGS 
   *  artists [ ] albums [x] songs [ ] = Scope.SONG, show all SONGS from ALBUMS 
   *  artists [ ] albums [ ] songs [x] = Scope.SONG, show all SONGS (from various sources)
   */


  public getRaterItems() {
    let whichOrientation = RaterOrientation.LEFT
    let items:RaterUIItem[] = [];
    if (this.filters.areEmpty()) {
      items = this.data.artists.map(it => {
        whichOrientation = switchOrientation(whichOrientation)
        return mapArtistToRaterUIItem(it, whichOrientation)
      })
    }
    else if (this.filters.onlyArtists()) {
      items = this.filters.filterAlbumsByArtist(this.data.albums).map(it => {
        whichOrientation = switchOrientation(whichOrientation)
        return mapAlbumToRaterUIItem(it, whichOrientation)
      })
    }
    else if (this.filters.onlyArtistsAndAlbums()) {
      items = this.filters.filterSongsByAlbum(this.data.songs)
        .map(song => {
          whichOrientation = switchOrientation(whichOrientation)
          const album = this.data.albums.find(it => it.id === song.albumId)
          const artist = this.data.artists.find(it => it.id === song.artistId) 
          if (album && artist) {
            return mapSongToRaterUIItem(song, album, artist, whichOrientation)
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
            return mapSongToRaterUIItem(song, album, artist, whichOrientation)
          } else {
            throw Error(`cannot find album for song ${song}`)
          }
        })
    }
      return items
  }
}