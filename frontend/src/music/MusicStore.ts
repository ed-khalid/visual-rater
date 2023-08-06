import { mapAlbumToUIItem, mapArtistToUIItem, mapSongToUIItem, mapUIItemToRaterUIItem } from "../functions/mapper"
import { Artist, Album, Song } from "../generated/graphql"
import { MusicData } from "./MusicData"
import { MusicFilters } from "./MusicFilters"
import { MusicZoomLevel, MusicState } from "./MusicState"


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

  public getAlbumsForArtist(artist:Artist) :Album[] {
    return this.data.albums.filter(it => it.artistId === artist.id)
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
    const artists = this.getSelectedArtists()
    const albums = artists.flatMap(it => this.getAlbumsForArtist(it))
    return albums.filter(it => !this.hasAlbumLoadedSongs(it)  )
  }
  
  public filterArtistsByScore = () => this.filters.filterByScore<Artist>(this.data.artists)
  public filterAlbumsByScore = () => this.filters.filterByScore<Album>(this.data.albums)
  public filterSongsByScore = () => this.filters.filterByScore<Song>(this.data.songs)

  public findSongById = (id:String) => this.data.songs.find(it => it.id === id)  

  public getItems() {
    switch(this.zoomLevel) {
      case MusicZoomLevel.ARTIST: {
        return this.getSelectedArtists().map(it => mapArtistToUIItem(it))
      }
      case MusicZoomLevel.ALBUM: {
        const artistAlbums = this.getSelectedArtists().flatMap(it => this.getAlbumsForArtist(it))
        return this.filters.filterAlbums(artistAlbums).map(it => mapAlbumToUIItem(it)) 
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
   *  artists [x] albums [ ] songs [ ] z [ARTIST]   show all selected artists 
   *  artists [x] albums [ ] songs [ ] z [ALBUM]   show all albums for selected artists 
   *  artists [x] albums [ ] songs [ ] z [SONG]   show all songs for selected artists 
   *  
   *  artists [x] albums [x] songs [ ] z [ARTIST] show all selected artists 
   *  artists [x] albums [x] songs [ ] z [ALBUM] show all selected albums for selected artists 
   *  artists [x] albums [x] songs [ ] z [SONG] show all songs for selected albums for selected artists 
   * 
   *  artists [x] albums [ ] songs [x] z [ARITST] show all selected artists   
   *  artists [x] albums [ ] songs [x] z [ALBUM] show all albums for selected songs for selected artists   
   *  artists [x] albums [ ] songs [x] z [SONG] show all selected songs for selected artists   
   * 
   *  artists [x] albums [x] songs [x] z [ARTIST] show all selected artists 
   *  artists [x] albums [x] songs [x] z [ALBUM] show all albums for selected artists 
   *  artists [x] albums [x] songs [x] z [SONG] show all selected songs for selected albums for selected artists 
   * 
 
   */

  public getRaterItems() {
    return this.getItems().map(item => mapUIItemToRaterUIItem(item, 1))
  }
}