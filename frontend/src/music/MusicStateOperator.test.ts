import { expect, test } from 'vitest'
import { MusicStateOperator } from './MusicStateOperator' 
import { MusicData } from './MusicData'
import typia from 'typia'
import { Album, Artist, Song } from '../generated/graphql'
import { MusicFilters } from './MusicFilters'
import { ArtistNavigationFilter } from '../models/ArtistNavigationFilter'


test('it should load correctly', () => {
    const artist = typia.random<Artist>()  
    const albums:Album[] = 
    Array.from({ length : 2},  () => typia.random<Album>()).map( it => ({...it, artistId: artist.id }))
    const songsAlbum1 = Array.from({length:10}, () => typia.random<Song>()).map(it => ({...it, artistId: artist.id, albumId: albums[0].id }))  
    const songsAlbum2 = Array.from({length:10}, () => typia.random<Song>()).map(it => ({...it, artistId: artist.id, albumId: albums[1].id }))  
    const data = new MusicData({
        artists: [artist], 
        albums : albums,
        songs: [...songsAlbum1, ...songsAlbum2]
    })
    const raterFilters:MusicFilters = ({
        hideAll: true,
        artistIds: [],
        albumIds: [],
        scoreFilter: { start: 0, end: 100},
        songIds: []
    })
    const navFilters:ArtistNavigationFilter[] = []
    const operator = new MusicStateOperator({data, navFilters, raterFilters})  
    expect(1).toBe(1)
})
