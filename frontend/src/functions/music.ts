import { RaterWrapperMode } from "../components/rater/RaterWrapper";
import { Album, Artist, Song } from "../generated/graphql";





    export const findAlbumAndArtist = (albumId:string, artists:Artist[]|undefined) : [Album|undefined, Artist|undefined] => {
      let retv:[Album|undefined, Artist|undefined]= [undefined,undefined]; 
      if (artists) {
            artists.find(artist => {
              const foundAlbum = artist.albums?.find(album => album?.id === albumId)
              if (foundAlbum) {
                retv = [foundAlbum, artist] 
                return true
              }
              else {
                return false
              }
            })
       }
      return retv
    }
    export const findItemsByIds = (ids:Array<string>, mode:RaterWrapperMode, artists:Artist[]|undefined) => {
      switch(mode) {
        case RaterWrapperMode.ARTIST: return artists!.filter(it => ids.includes(it.id))  
        case RaterWrapperMode.ALBUM: return getAllAlbums(artists).filter(it => ids.includes(it.album.id)) 
        case RaterWrapperMode.SONG: return getAllSongs(artists).filter(it => ids.includes(it.song.id))  
      }
    }
    export const getAllAlbums = (artists:Artist[]|undefined) => {
        if (!artists) return []
      return artists!.reduce<Array<{album: Album, artist:Artist}>>((acc, curr) => {
        const retv = curr.albums!.map(it => ({album:it as Album, artist:curr}))
        acc =  [ ...acc, ...retv]
        return acc
      },[])
    }

    export const getAllSongs = (artists:Artist[]|undefined) => {
        if (!artists) return [ ]
      return getAllAlbums(artists).reduce<Array<{song:Song,album:Album, artist:Artist}>>((acc,curr) => {
        const retv = curr.album.songs!.map(it => ({song:it as Song, album: curr.album, artist:curr.artist}))
        acc = [...acc, ...retv]
        return acc
      }, [])
    } 