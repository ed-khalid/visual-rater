import typia from "typia"
import { Album, Artist, Song } from "../generated/graphql"
import { MusicData } from "../music/MusicData"

export const randomIntBetween = (lo:number, hi:number) => Math.floor(Math.random() * (hi-lo + 1)) + lo


export const setupData = (numberOfArtists?:number) => {
    const artists:Artist[] = Array.from({length: numberOfArtists ? numberOfArtists:randomIntBetween(2,5)}, () => typia.random<Artist>())  
    let albums:Album[] = []
    let songs:Song[] = []
    artists.forEach((artist) => {
        const artistAlbums:Album[] = Array.from({ length : randomIntBetween(2,4) },  () => typia.random<Album>()).map( it => ({...it, artistId: artist.id }))
        artistAlbums.forEach((album) => {
            const albumSongs = Array.from({length:randomIntBetween(6, 12)}, () => typia.random<Song>()).map(it => ({...it, artistId: artist.id, albumId: album.id}))
            songs = [...songs, ...albumSongs]
        })
        albums = [...albums, ...artistAlbums]
    })
    return new MusicData({
        artists: artists, 
        albums : albums,
        songs: songs 
    })
} 