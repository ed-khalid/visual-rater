import { expect, test } from 'vitest'
import { MusicStateOperator } from './MusicStateOperator' 
import { MusicState } from './MusicState'
import { setupData } from '../functions/testhelpers'
import { AlbumRaterFilter, NavigationFilter, RaterFilter } from './MusicFilterModels'



/***
 *  states we need to have:
 *  show nothing
 *  show everything
 *  show a single artist
 *  show artist, with a combination of their albums
 * 
 ***/
const data = setupData() 

test('it should show nothing if nothing is selected', () => {
    
    const navigationFilters:NavigationFilter[] = []
    const raterFilters:RaterFilter[] = []
    const state:MusicState = {
        data,
        navigationFilters,
        raterFilters
    }  
    const operator:MusicStateOperator = new MusicStateOperator(state)

    const songs = operator.getFatSongs()  
    expect(songs.length).toBe(0)
})
test('it should show everything if everything is selected', () => {
    const raterFilters = data.artists.map((artist) => {
        const albumFilters =  data.albums.filter( it => it.artistId === artist.id).map(album => {
            return new AlbumRaterFilter(album.id,[])
        })  
        return new RaterFilter(artist.id, albumFilters)
    })
    const expected = data.songs.length  
    const navigationFilters:NavigationFilter[] = []
    const state:MusicState = {
        data,
        navigationFilters,
        raterFilters
    }  
    const operator:MusicStateOperator = new MusicStateOperator(state)
    const songs = operator.getFatSongs()  
    expect(songs.length).toBe(expected)
})

test('it should show nothing if an artistid is filtered without any albums', () => {
    const artistId = data.artists[0].id 
    const raterFilters:RaterFilter[] = [new RaterFilter(artistId, [])]
    const navigationFilters:NavigationFilter[] = []
    const state:MusicState = {
        data,
        navigationFilters,
        raterFilters
    }  
    const operator:MusicStateOperator = new MusicStateOperator(state)
    const songs = operator.getFatSongs()  
    expect(songs.length).toBe(0)
})

test('it should show everything if an artistid/albumid are filtered without songs', () => {
    const raterFilters = data.artists.map(artist => {
        const albumFilters = data.albums.filter(it => it.artistId === artist.id).map(it => new AlbumRaterFilter(it.id, []) ) 
        return new RaterFilter(artist.id, albumFilters)
    })
    const navigationFilters:NavigationFilter[] = []
    const state:MusicState = {
        data,
        navigationFilters,
        raterFilters
    }  
    const allSongs = data.songs  
    const operator:MusicStateOperator = new MusicStateOperator(state)
    const songs = operator.getFatSongs()  
    expect(songs.length).toBe(allSongs.length)
})