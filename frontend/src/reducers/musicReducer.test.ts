import { expect, test } from "vitest";
import { setupData as setupTestData } from "../functions/testhelpers";
import { FilterMode, NavigationFilter, RaterFilter } from "../music/MusicFilterModels";
import { MusicState } from "../music/MusicState";
import { musicReducer } from "./musicReducer";
import typia from "typia";
import { Album, Artist, Song } from "../generated/graphql";


const data = setupTestData()
const navigationFilters:NavigationFilter[] = []
const raterFilters:RaterFilter[] = []
const state:MusicState = {
    data,
    navigationFilters,
    raterFilters
}  

/* DATA_CHANGE tests */
test("it should add an artist", () => {
    const newArtist = typia.random<Artist>() 
    newArtist.id = 'new-artist' 
    const newState =  musicReducer(state, { type: 'DATA_CHANGE', data: { artists: [newArtist]  }   })
    const artistAdded = newState.data.artists.find(it => it.id === newArtist.id)
    expect(artistAdded).toBe(newArtist)

})
test("it should not add an artist if it already exists", () => {
    const existingArtist =  state.data.artists[0]  
    const newState =  musicReducer(state, { type: 'DATA_CHANGE', data: { artists: [existingArtist]  }   })
    const artistAdded = newState.data.artists.filter(it => it.id === existingArtist.id)
    expect(artistAdded.length).toBe(1)

})
test("it should add an album", () => {
    const newAlbum = typia.random<Album>() 
    newAlbum.id = 'new-album' 
    const newState =  musicReducer(state, { type: 'DATA_CHANGE', data: { albums: [newAlbum]  }   })
    const added = newState.data.albums.find(it => it.id === newAlbum.id)
    expect(added).toBe(newAlbum)
})
test("it should not add an album if it already exists", () => {
    const existing =  state.data.albums[0]  
    const newState =  musicReducer(state, { type: 'DATA_CHANGE', data: { albums: [existing]  }   })
    const added = newState.data.albums.filter(it => it.id === existing.id)
    expect(added.length).toBe(1)

})
test("it should add a song", () => {
    const newEntry = typia.random<Song>() 
    newEntry.id = 'new-song' 
    const newState =  musicReducer(state, { type: 'DATA_CHANGE', data: { songs: [newEntry]  }   })
    const added = newState.data.songs.find(it => it.id === newEntry.id)
    expect(added).toBe(newEntry)
})
test("it should not add a songs if it already exists", () => {
    const existing =  state.data.songs[0]  
    const newState =  musicReducer(state, { type: 'DATA_CHANGE', data: { songs: [existing]  }   })
    const added = newState.data.songs.filter(it => it.id === existing.id)
    expect(added.length).toBe(1)
})
/* NAVIGATION_FILTER_ARTIST_CHANGE tests */ 
test("it should add a navigation artist", () => {
    const artistId = data.artists[0].id 
    const newState =  musicReducer(state, { type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId, mode: FilterMode.ADDITIVE })
    const added = newState.navigationFilters.find(it => it.artistId === artistId)
    expect(added?.artistId).toBe(artistId)
})
test("it shouldn't double add a navigation artist", () => {
    const artistId = data.artists[0].id 
    const newState =  musicReducer(state, { type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId, mode: FilterMode.ADDITIVE })
    const added = newState.navigationFilters.find(it => it.artistId === artistId)
    expect(added?.artistId).toBe(artistId)
    const newState2 =  musicReducer(state, { type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId, mode: FilterMode.ADDITIVE })
    const added2 = newState2.navigationFilters.filter(it => it.artistId === artistId)
    expect(added2?.length).toBe(1)
})
test("it should remove a navigation artist", () => {
    const artistId = data.artists[0].id 
    musicReducer(state, { type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId, mode: FilterMode.ADDITIVE })
    const newState =  musicReducer(state, { type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId, mode: FilterMode.REDUCTIVE })
    const removed = newState.navigationFilters.find(it => it.artistId === artistId)
    expect(removed).toBe(undefined)
})
test("it should exclusive filter a navigation artist", () => {
    let newState = state 
    data.artists.map(it => it.id).forEach((artistId) => {
      newState = musicReducer(newState, { type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId , mode: FilterMode.ADDITIVE })
    })
    const exclusiveArtistId = newState.navigationFilters[0].artistId   
    newState = musicReducer(newState, { type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId: newState.navigationFilters[0].artistId , mode: FilterMode.EXCLUSIVE })
    expect(newState.navigationFilters.length).toBe(1)
    expect(newState.navigationFilters[0].artistId).toBe(exclusiveArtistId)
})
/* NAVIGATION_FILTER_ALBUM_CHANGE tests */
test("it should add a navigation album and create a navigation artist filter if there isn't one", () => {
    const albumId = data.albums[0].id 
    const artistId = data.albums[0].artistId
    const newState =  musicReducer(state, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId, albumId , mode: FilterMode.ADDITIVE })
    const added = newState.navigationFilters.find(it => it.artistId === artistId)
    expect(added?.artistId).toBe(artistId)
    expect(added?.albumIds.length).toBe(1)
    expect(added?.albumIds[0]).toBe(albumId)
})
test("it should add an navigation album to an already existing navigation artist", () => {
    const artistId = data.artists[0].id 
    const newState =  musicReducer(state, { type: 'NAVIGATION_FILTER_ARTIST_CHANGE', artistId, mode: FilterMode.ADDITIVE })
    const added = newState.navigationFilters.find(it => it.artistId === artistId)
    expect(added?.artistId).toBe(artistId)
    expect(added?.albumIds.length).toBe(0)
    const albumId = data.albums[0].id 
    const newState2 =  musicReducer(state, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId, albumId , mode: FilterMode.ADDITIVE })
    const added2 = newState2.navigationFilters.find(it => it.artistId === artistId)
    expect(added2?.artistId).toBe(artistId)
    expect(added2?.albumIds.length).toBe(1)
    expect(added2?.albumIds[0]).toBe(albumId)
})
test("it should add an navigation album to an already existing navigation artist with a navigation album", () => {
    const artistWithMultipleAlbums = data.artists.find( it => it.albums.length > 1)   
    if (!artistWithMultipleAlbums) throw "error setting up test data, all artists should have at least more than 1 album"
    const artistId = artistWithMultipleAlbums.id 
    const albumId = artistWithMultipleAlbums.albums[0].id 
    const albumId2 = artistWithMultipleAlbums.albums[1].id 
    const state2 = musicReducer(state, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId, albumId , mode: FilterMode.ADDITIVE })
    const state3 =  musicReducer(state2, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId, albumId: albumId2 , mode: FilterMode.ADDITIVE })
    const added2 = state3.navigationFilters.find(it => it.artistId === artistId)
    expect(added2?.artistId).toBe(artistId)
    expect(added2?.albumIds.length).toBe(2)
    expect(added2?.albumIds[0]).toBe(albumId)
    expect(added2?.albumIds[1]).toBe(albumId2)
})
test("it shouldn't double add a navigation album", () => {
    const artistWithMultipleAlbums = data.artists.find( it => it.albums.length > 1)   
    if (!artistWithMultipleAlbums) throw "error setting up test data, all artists should have at least more than 1 album"
    const artistId = artistWithMultipleAlbums.id 
    const albumId = artistWithMultipleAlbums.albums[0].id 
    const state2 =  musicReducer(state, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId, albumId , mode: FilterMode.ADDITIVE })
    const state3 =  musicReducer(state2, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId, albumId, mode: FilterMode.ADDITIVE })
    const added2 = state3.navigationFilters.find(it => it.artistId === artistId)
    expect(added2?.albumIds.length).toBe(1)
})
test("it should remove a navigation album", () => {
    const artistWithMultipleAlbums = data.artists.find( it => it.albums.length > 1)   
    if (!artistWithMultipleAlbums) throw "error setting up test data, all artists should have at least more than 1 album"
    const artistId = artistWithMultipleAlbums.id 
    const albumId = artistWithMultipleAlbums.albums[0].id 
    const albumId2 = artistWithMultipleAlbums.albums[1].id 
    const state2 = musicReducer(state, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId, albumId , mode: FilterMode.ADDITIVE })
    const state3 =  musicReducer(state2, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId, albumId: albumId2 , mode: FilterMode.ADDITIVE })
    const state4 = musicReducer(state3, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId, albumId, mode: FilterMode.REDUCTIVE })
    const artistNavFilter = state4.navigationFilters.find(it => it.artistId === artistId)
    expect(artistNavFilter?.albumIds.length).toBe(1)
    const removed = artistNavFilter?.albumIds.find(it => it === albumId)
    expect(removed).toBe(undefined)
})
test("it should exclusive filter a navigation album", () => {
    let newState = state 
    data.albums.forEach((album) => {
      newState = musicReducer(newState, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', albumId: album.id, artistId: album.artistId, mode: FilterMode.ADDITIVE })
    })
    const randomAlbumIndex = Math.floor(Math.random() * data.albums.length)   
    const randomAlbum = data.albums[randomAlbumIndex] 
    newState = musicReducer(newState, { type: 'NAVIGATION_FILTER_ALBUM_CHANGE', artistId: randomAlbum.artistId, albumId: randomAlbum.id,  mode: FilterMode.EXCLUSIVE })
    expect(newState.navigationFilters.length).toBe(1)
    expect(newState.navigationFilters[0].albumIds.length).toBe(1)
    expect(newState.navigationFilters[0].albumIds[0]).toBe(randomAlbum.id)
})
/* RATER FILTER TESTS */
test("adding an artistId to raterfilter should add all of their albumids", () =>  {
    const artist = data.artists[0]  
    const albumIds = data.albums.filter(it => it.artistId === artist.id).map(it => it.id) 
    const state2 = musicReducer(state, { type: 'RATER_FILTER_ARTIST_CHANGE',  artistId: artist.id, albumIds, mode: FilterMode.ADDITIVE} )
    expect(state2.raterFilters.length).toBe(1)
    expect(state2.raterFilters[0].artistId).toBe(artist.id)
    expect(state2.raterFilters[0].albums.length).toBe(albumIds.length)
    albumIds.forEach((albumId) => {
        expect(state2.raterFilters.flatMap(it => it.albums.map(it => it.albumId)).find(it => it === albumId)).toBe(albumId)
    })
})
test("adding an already existing artistId to raterfilter should cause no change", () => {
    const artist = data.artists[0]  
    const albumIds = data.albums.filter(it => it.artistId === artist.id).map(it => it.id) 
    const state2 = musicReducer(state, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds,  artistId: artist.id, mode: FilterMode.ADDITIVE} )
    const state3 = musicReducer(state2, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds,  artistId: artist.id, mode: FilterMode.ADDITIVE} )
    expect(state3.raterFilters.length).toBe(1)
    expect(state3.raterFilters[0].artistId).toBe(artist.id)
    expect(state3.raterFilters[0].albums.length).toBe(albumIds.length)
    albumIds.forEach((albumId) => {
        expect(state3.raterFilters.flatMap(it => it.albums.map(it => it.albumId)).find(it => it === albumId)).toBe(albumId)
    })
})
test("exclusive add an artist id", () => {
    const data = setupTestData(4)  
    const state:MusicState = {
        data,
        navigationFilters,
        raterFilters
    }  
    const artist = data.artists[0]  
    const albums = artist.albums.map(it => it.id) 
    const artist2 = data.artists[1]  
    const albums2 = artist2.albums.map(it => it.id) 
    const artist3 = data.artists[2]  
    const albums3 = artist2.albums.map(it => it.id) 
    const state2 = musicReducer(state, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums,  artistId: artist.id, mode: FilterMode.ADDITIVE} )
    const state3 = musicReducer(state2, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums2,   artistId: artist2.id, mode: FilterMode.ADDITIVE} )
    const state4 = musicReducer(state3, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums3,  artistId: artist3.id, mode: FilterMode.EXCLUSIVE} )
    expect(state4.raterFilters.length).toBe(1)
    expect(state4.raterFilters[0].artistId).toBe(artist3.id)
})
test("double exclusive add an artist id", () => {
    const data = setupTestData(4)  
    const state:MusicState = {
        data,
        navigationFilters,
        raterFilters
    }  
    const artist = data.artists[0]  
    const albums = artist.albums.map(it => it.id) 
    const artist2 = data.artists[1]  
    const albums2 = artist2.albums.map(it => it.id) 
    const artist3 = data.artists[2]  
    const albums3 = artist2.albums.map(it => it.id) 
    const state2 = musicReducer(state, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums,  artistId: artist.id, mode: FilterMode.ADDITIVE} )
    const state3 = musicReducer(state2, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums2,  artistId: artist2.id, mode: FilterMode.ADDITIVE} )
    const state4 = musicReducer(state3, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums3,  artistId: artist3.id, mode: FilterMode.EXCLUSIVE} )
    const state5 = musicReducer(state4, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums3,  artistId: artist3.id, mode: FilterMode.EXCLUSIVE} )
    expect(state5.raterFilters.length).toBe(1)
    expect(state5.raterFilters[0].artistId).toBe(artist3.id)
})
test("rater filter - remove an artist id", () => {
    const data = setupTestData(4)  
    const state:MusicState = {
        data,
        navigationFilters,
        raterFilters
    }  
    const artist = data.artists[0]  
    const albums = artist.albums.map(it => it.id) 
    const artist2 = data.artists[1]  
    const albums2 = artist2.albums.map(it => it.id) 
    const artist3 = data.artists[2]  
    const albums3 = artist3.albums.map(it => it.id) 
    const state2 = musicReducer(state, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums,  artistId: artist.id, mode: FilterMode.ADDITIVE} )
    const state3 = musicReducer(state2, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums2,  artistId: artist2.id, mode: FilterMode.ADDITIVE} )
    const state4 = musicReducer(state3, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums3,  artistId: artist3.id, mode: FilterMode.ADDITIVE} )
    const state5 = musicReducer(state4, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums2,  artistId: artist2.id, mode: FilterMode.REDUCTIVE} )
    expect(state5.raterFilters.length).toBe(2)
    expect(state5.raterFilters[0].artistId).toBe(artist.id)
    expect(state5.raterFilters[1].artistId).toBe(artist3.id)

})
test("rater filter - remove a nonexistent artist id", () => {
    const data = setupTestData(4)  
    const state:MusicState = {
        data,
        navigationFilters,
        raterFilters
    }  
    const artist = data.artists[0]  
    const albums = artist.albums.map(it => it.id) 
    const artist2 = data.artists[1]  
    const albums2 = artist2.albums.map(it => it.id) 
    const artist3 = data.artists[2]  
    const albums3 = artist3.albums.map(it => it.id) 
    const artist4 = data.artists[3]  
    const albums4 = artist4.albums.map(it => it.id) 
    const state2 = musicReducer(state, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums,   artistId: artist.id, mode: FilterMode.ADDITIVE} )
    const state3 = musicReducer(state2, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums2,  artistId: artist2.id, mode: FilterMode.ADDITIVE} )
    const state4 = musicReducer(state3, { type: 'RATER_FILTER_ARTIST_CHANGE', albumIds: albums3,  artistId: artist3.id, mode: FilterMode.ADDITIVE} )
    const state5 = musicReducer(state4, { type: 'RATER_FILTER_ARTIST_CHANGE',  albumIds: albums4, artistId: artist4.id, mode: FilterMode.REDUCTIVE} )
    expect(state5.raterFilters.length).toBe(3)
    expect(state5.raterFilters[0].artistId).toBe(artist.id)
    expect(state5.raterFilters[1].artistId).toBe(artist2.id)
    expect(state5.raterFilters[2].artistId).toBe(artist3.id)

})
test("rater fitler - adding an album id, artist doesn't exist", () => {
    const album = data.albums[0] 
    const state2 = musicReducer(state, { type: 'RATER_FILTER_ALBUM_CHANGE',  albumId: album.id, artistId: album.artistId, mode: FilterMode.ADDITIVE} )
    expect(state2.raterFilters.length).toBe(1)
    expect(state2.raterFilters[0].artistId).toBe(album.artistId)
    expect(state2.raterFilters[0].albums.length).toBe(1)
    expect(state2.raterFilters[0].albums[0].albumId).toBe(album.id)
})
test("rater filter - removing an  album", () => {
    const album = data.albums[0] 
    const artist = data.artists.find(it => it.id === album.artistId) 
    const albums = data.albums.filter(it => it.artistId == artist!.id) 
    let newState:MusicState = state   
    albums.forEach((album) => {
        newState = musicReducer(newState, { type: 'RATER_FILTER_ALBUM_CHANGE', albumId: album.id, artistId: album.artistId, mode: FilterMode.ADDITIVE}  )
    })
    newState = musicReducer(newState, { type: 'RATER_FILTER_ALBUM_CHANGE', albumId: album.id, artistId: album.artistId, mode: FilterMode.REDUCTIVE}  )
    expect(newState.raterFilters.length).toBe(1)
    expect(newState.raterFilters[0].albums.length).toBe(albums.length-1)

})
test("rater filter - removing the last album of an artist should also remove the artist filter altogether", () => {
    const album = data.albums[0] 
    const artist = data.artists.find(it => it.id === album.artistId) 
    const albums = data.albums.filter(it => it.artistId == artist!.id) 
    let newState:MusicState = state   
    albums.forEach((album) => {
        newState = musicReducer(newState, { type: 'RATER_FILTER_ALBUM_CHANGE', albumId: album.id, artistId: album.artistId, mode: FilterMode.ADDITIVE}  )
    })
    albums.forEach((album) => {
        newState = musicReducer(newState, { type: 'RATER_FILTER_ALBUM_CHANGE', albumId: album.id, artistId: album.artistId, mode: FilterMode.REDUCTIVE}  )
    })
    expect(newState.raterFilters.length).toBe(0)
})
