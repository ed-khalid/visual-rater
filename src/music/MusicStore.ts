import { mapAlbumToUIItem, mapArtistToUIItem, mapSongToUIItem, mapUIItemToRaterUIItem } from "../functions/mapper"
import { Artist, Album, Song } from "../generated/graphql"
import { RaterOrientation } from "../models/ui/RaterTypes"
import { MusicData } from "./MusicData"
import { MusicFilters } from "./MusicFilters"
import { MusicZoomLevel, MusicState } from "./MusicState"


const switchOrientation = (orientation: RaterOrientation) => {
  return orientation === RaterOrientation.LEFT ? RaterOrientation.RIGHT : RaterOrientation.LEFT
}

export const createMusicStore = (state:MusicState) => {

}

export class MusicStore {
  public filters:MusicFilters;  
  public data:MusicData;  
  public zoomLevel:MusicZoomLevel
     
  constructor(state:MusicState) {
    this.data = state.data
    this.filters = new MusicFilters(state.filters)
    this.zoomLevel = state.zoomLevel 
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
  public hasAlbumLoadedSongs(album:Album) : boolean {
    return this.data.songs.filter(it => it.albumId === album.id).length !== 0 
  }

  public getLazyArtists() : Artist[]  {
    return this.getSelectedArtists().filter(it => !this.hasArtistLoadedAlbums(it))
  }
  public getLazyAlbums() : Album[]  {
    return this.getSelectedAlbums().filter(it => !this.hasAlbumLoadedSongs(it)  )
  }
  
  public filterArtistsByScore = () => this.filters.filterByScore<Artist>(this.data.artists)
  public filterAlbumsByScore = () => this.filters.filterByScore<Album>(this.data.albums)
  public filterSongsByScore = () => this.filters.filterByScore<Song>(this.data.songs)

  public getItems() {
    switch(this.zoomLevel) {
      case MusicZoomLevel.ALL: {
        return this.data.artists.map(it => mapArtistToUIItem(it))
      }
      case MusicZoomLevel.ARTIST: {
        return this.getSelectedArtists().map(it => mapArtistToUIItem(it))
      }
      case MusicZoomLevel.ALBUM: {
        return this.filters.filterAlbumsByArtist(this.data.albums).map(it => mapAlbumToUIItem(it))
      }
      case MusicZoomLevel.SONG: {
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
    const items = this.getItems(); 
    let orientation = RaterOrientation.LEFT
    return items.map(item => { 
      const retv = mapUIItemToRaterUIItem(item, orientation,1)
      orientation = switchOrientation(orientation)   
      return retv
    })
  }
}