import { mapAlbumToRatedItem, mapArtistToRatedItem, mapSongToRatedItem } from "../../functions/mapper";
import { Album, Artist, Song } from "../../generated/graphql"
import { RatedMusicItemUI } from "../ui/ItemTypes";
import { RaterOrientation } from "../ui/RaterTypes";

export type MusicEntity = Artist | Album | Song 
type ScoreFilter = { start: number, end: number }
export enum MusicScope {
  ARTIST, ALBUM, SONG
} 

const switchOrientation = (orientation: RaterOrientation) => {
  return orientation === RaterOrientation.LEFT ? RaterOrientation.RIGHT : RaterOrientation.LEFT
}

export class MusicData {
  public artists: Artist[]
  public albums: Album[]
  public songs: Song[]
  constructor(musicObj: { artists: Artist[], albums: Album[], songs: Song[] }) {
    this.artists = musicObj.artists
    this.albums = musicObj.albums
    this.songs = musicObj.songs
  }
}

export class MusicFilters {
  private artistIds?: String[]
  private albumIds?: String[]
  private songIds?: String[]
  private scoreFilter?: ScoreFilter
  constructor(filtersObj: { artistIds?: String[], albumIds?: String[], songIds?: String[], scoreFilter?: ScoreFilter }) {
    this.artistIds = filtersObj.artistIds
    this.albumIds = filtersObj.albumIds
    this.songIds = filtersObj.songIds
    this.scoreFilter = filtersObj.scoreFilter
  }

  public areEmpty(): boolean {
    const artistsEmpty =  (this.artistIds) ? this.artistIds.length === 0 : true  
    const albumsEmpty =  (this.albumIds) ? this.albumIds.length === 0 : true  
    const songsEmpty =  (this.songIds) ? this.songIds.length === 0 : true  
    return artistsEmpty && albumsEmpty && songsEmpty
  }
  public hasArtistsFilter(): boolean {
    return !!(this.artistIds && this.artistIds.length)
  }
  public hasAlbumsFilter(): boolean {
    return !!(this.albumIds && this.albumIds.length)
  }
  public hasSongsFilter(): boolean {
    return !!(this.songIds && this.songIds.length)
  }

  public onlyArtists(): boolean {
    return this.hasArtistsFilter() && !this.hasAlbumsFilter() && !this.hasSongsFilter()
  }
  public onlyArtistsAndAlbums(): boolean {
    return this.hasArtistsFilter() && this.hasAlbumsFilter() && !this.hasSongsFilter()
  }
  public onlyArtistsAndSongs(): boolean {
    return this.hasArtistsFilter() && !this.hasAlbumsFilter() && this.hasSongsFilter()
  }

  public filterByScore = <T extends MusicEntity> (arr: Array<T>) => arr.filter(it => ( this.scoreFilter && it.score) ? it.score >= this.scoreFilter.start && it.score <= this.scoreFilter.end : true)
  private filterById = (id:string, arr?:String[]) => (arr) ? arr.includes(id) : true
  public filterArtists = (artists: Artist[]) => artists.filter(it => this.filterById(it.id, this.artistIds))
  public filterAlbums = (albums: Album[]) => albums.filter(it => this.filterById(it.id, this.albumIds))
  public filterAlbumsByArtist = (albums: Album[]) => albums.filter(it => this.filterById(it.artistId, this.artistIds))
  public filterSongs = (songs: Song[]) => songs.filter(it => this.filterById(it.id, this.songIds))
  public filterSongsByAlbum = (songs: Song[]) => songs.filter(it => this.filterById(it.albumId, this.albumIds))
  public filterSongsByArtist = (songs: Song[]) => songs.filter(it => this.filterById(it.artistId,this.artistIds))

}


// helper class to access data/filters
export class MusicStore {
  constructor(public data: MusicData, public filters: MusicFilters) {
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
          if (album) {
            return mapSongToRatedItem(song, album, whichOrientation)
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
          if (album) {
            return mapSongToRatedItem(song, album, whichOrientation)
          } else {
            throw Error(`cannot find album for song ${song}`)
          }
        })
    }
      return items
  }
}


    export type MusicState = {
      data: {
        artists: Artist[]
        albums: Album[],
        songs: Song[]
      }
      filters: {
        artistIds: string[]
        albumIds: string[]
        songIds: string[]
        scoreFilter: { start: number, end: number }
      }
    }

