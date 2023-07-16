import { createRef } from "react";
import { Album, Artist, Song } from "../../generated/graphql"
import { RatedMusicItemUI, RatedSongItemUI } from "../ui/ItemTypes";
import { RaterOrientation } from "../ui/RaterTypes";

type ScoreFilter = { start: number, end: number }
export enum MusicScope {
  ALL, ARTIST, ALBUM, SONG
} 

const mapSongToRatedItem = (song: Song, album: Album, orientation: RaterOrientation): RatedSongItemUI => new RatedSongItemUI({ id: song.id, name: song.name }, song.score!, album.thumbnail!, orientation, 1, album.dominantColor, song.number, createRef(), album.name);
const mapAlbumToRatedItem = (album: Album, orientation: RaterOrientation): RatedMusicItemUI => new RatedMusicItemUI({ id: album.id, name: album.name }, album.score!, album.thumbnail!, orientation, 1, createRef(), album.dominantColor)
const mapArtistToRatedItem = (artist: Artist, orientation: RaterOrientation): RatedMusicItemUI => new RatedMusicItemUI({ id: artist.id, name: artist.name }, artist.score!, artist.thumbnail!, orientation, 1, createRef(), '(0,0,0)')
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

  private filterByScore = (score: number) => (this.scoreFilter) ? score >= this.scoreFilter.start && score <= this.scoreFilter.end : true
  private filterById = (id:string, arr?:String[]) => (arr) ? arr.includes(id) : true
  public filterArtistsbyScore = (artists: Artist[]) => artists.filter(it => this.filterByScore(it.score!))
  public filterAlbumsByScore = (albums: Album[]) => albums.filter(it => this.filterByScore(it.score!))
  public filterSongsByScore = (songs: Song[]) => songs.filter(it => this.filterByScore(it.score!))
  public filterArtists = (artists: Artist[]) => artists.filter(it => this.filterById(it.id, this.artistIds))
  public filterAlbums = (albums: Album[]) => albums.filter(it => this.filterById(it.id, this.albumIds))
  public filterAlbumsByArtist = (albums: Album[]) => albums.filter(it => this.filterById(it.artistId, this.artistIds))
  public filterSongs = (songs: Song[]) => songs.filter(it => this.filterById(it.id, this.songIds))
  public filterSongsByAlbum = (songs: Song[]) => songs.filter(it => this.filterById(it.albumId, this.albumIds))
  public filterSongsByArtist = (songs: Song[]) => songs.filter(it => this.filterById(it.artistId,this.artistIds))

}


export class MusicStore {
  constructor(public data: MusicData, public filters: MusicFilters) {
  }

  public scope:MusicScope = MusicScope.ALL 


  public getSelectedArtists(): Artist[] {
    return this.filters.filterArtists(this.data.artists)
  }  
  public getSelectedAlbumsWithSongs(): Album[] {
    const selectedAlbums = this.filters.filterAlbums(this.data.albums)
    const songs = this.filters.filterSongsByAlbum(this.data.songs) 
    songs.forEach(song => {
      const album = selectedAlbums.find(it => it.id === song.albumId)
      if (album) {
        album.songs = [...album.songs, song]
      }
    })
    return selectedAlbums
  }  

  public hasNoFilters(): boolean {
    return this.filters.areEmpty()
  }
  public filterArtistsByScore = () => this.filters.filterArtistsbyScore(this.data.artists)
  public filterAlbumsByScore = () => this.filters.filterAlbumsByScore(this.data.albums)
  public filterSongsByScore = () => this.filters.filterSongsByScore(this.data.songs)

  public getItems() {
    let whichOrientation = RaterOrientation.LEFT
    let items:RatedMusicItemUI[] = [];
    if (this.filters.areEmpty()) {
      items = this.data.artists.map(it => {
        whichOrientation = switchOrientation(whichOrientation)
        return mapArtistToRatedItem(it, whichOrientation)
      })
      this.scope = MusicScope.ARTIST
    }
    else if (this.filters.onlyArtists()) {
      items = this.filters.filterAlbumsByArtist(this.data.albums).map(it => {
        whichOrientation = switchOrientation(whichOrientation)
        return mapAlbumToRatedItem(it, whichOrientation)
      })
      this.scope = MusicScope.ALBUM

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
      this.scope = MusicScope.SONG
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
      this.scope = MusicScope.SONG
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

