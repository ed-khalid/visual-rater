import { afterEach, describe, expect, test, vi } from 'vitest'
import { emptyPersisted, type StartState } from '../shared/model'
import { artistScoreOf, firstOnTree, fruitCount, hasAlbums, isLoaded, type Library, rating } from './board'
import { artistNodes } from './drill'
import { loadArtists, loadArtistsFor, loadMoreArtists, startSync, useArtistPages, useSync } from './remote'
import { initialState, useStore } from './store'

/** Lou loaded (one album on the tree, one track 96 → 6 points); Nina not yet, known only by her summary. */
const lib = (): Library => ({
  ...emptyPersisted(),
  artists: { lou: { id: 'lou', name: 'Lou' }, nina: { id: 'nina', name: 'Nina' } },
  albums: { a1: { id: 'a1', name: 'One', artistId: 'lou', tracklistLoaded: true, stagedAt: 1, addedAt: 50 } },
  tracks: { t1: { id: 't1', name: 'Song', albumId: 'a1', artistId: 'lou', score: 96, branch: { angle: 0, length: 1, ring: 0 }, since: 50 } },
  artistInfo: { nina: { score: 12.5, albums: 3, firstAdded: 10, fruit: 30 } },
})

describe('an artist before and after their albums load', () => {
  test('scores, albums and the tree come from the summary until they load, then from their tracks', () => {
    const s = lib()
    expect([isLoaded(s, 'lou'), isLoaded(s, 'nina')]).toEqual([true, false])
    expect([artistScoreOf(s, 'lou'), artistScoreOf(s, 'nina')]).toEqual([6, 12.5])
    expect(rating(s, 'nina').label).toBe('12.5')
    expect([hasAlbums(s, 'nina'), firstOnTree(s, 'nina'), firstOnTree(s, 'lou'), firstOnTree(s, 'lou', new Set(['a1']))]).toEqual([true, 10, 50, undefined])
    expect(fruitCount(s, 'music')).toBe(31)
    // on the rater in the order their first album went on
    expect(artistNodes(s, new Set()).map(n => [n.id, n.score])).toEqual([['nina', 12.5], ['lou', 6]])
  })
})

describe('loadArtists', () => {
  const start: StartState = {
    ...emptyPersisted(), artists: lib().artists, artistInfo: { lou: { score: 6, albums: 1, firstAdded: 50, fruit: 1 } }, next: null,
  }
  const posts: unknown[] = []
  afterEach(() => { vi.unstubAllGlobals(); posts.length = 0; useStore.setState(initialState()) })
  const serve = (library: unknown) => { vi.stubGlobal('window', { addEventListener: () => {}, removeEventListener: () => {} }); vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    if (url === '/api/state') return new Response(JSON.stringify(start))
    if (url.startsWith('/api/library/artists')) return new Response(JSON.stringify(library))
    posts.push(JSON.parse(String(init?.body))); return new Response('{}')
  })) }

  test('adds an artist\'s albums and tracks as already saved: nothing is sent back, and they load once', async () => {
    const { albums, tracks } = lib()
    serve({ albums, tracks })
    await startSync()
    expect(useSync.getState().status).toBe('ready')
    await loadArtists(['lou'])
    expect(useStore.getState().tracks.t1.score).toBe(96)
    expect(useStore.getState().artistInfo).toEqual({})
    await loadArtists(['lou'])
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.filter(([u]) => String(u).startsWith('/api/library'))).toHaveLength(1)
    // a change after loading is saved as usual, and only that
    useStore.setState({ tracks: { ...useStore.getState().tracks, t1: { ...useStore.getState().tracks.t1, score: 80 } } })
    await new Promise(r => setTimeout(r, 400))
    expect(posts).toHaveLength(1)
    expect((posts[0] as { upsert: { tracks: { id: string }[], albums: unknown[] } }).upsert.tracks.map(t => t.id)).toEqual(['t1'])
    expect((posts[0] as { upsert: { albums: unknown[] } }).upsert.albums).toEqual([])
  })
})

describe('artists a page at a time', () => {
  const kim = { id: 'kim', name: 'Kim' }, joe = { id: 'joe', name: 'Joe', vendor: { name: 'spotify' as const, id: 'joe-spotify' } }
  const start: StartState = {
    ...emptyPersisted(), artists: { lou: { id: 'lou', name: 'Lou' } }, artistInfo: { lou: { score: 6, albums: 1, firstAdded: 50, fruit: 1 } }, next: 'c1',
  }
  const posts: unknown[] = []
  const urls: string[] = []
  afterEach(() => { vi.unstubAllGlobals(); posts.length = 0; urls.length = 0; useStore.setState(initialState()) })
  const serve = () => { vi.stubGlobal('window', { addEventListener: () => {}, removeEventListener: () => {} }); vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    urls.push(url)
    if (url === '/api/state') return new Response(JSON.stringify(start))
    // the next page brings Kim, and Lou again (his score changed since): the Lou here is kept
    if (url.startsWith('/api/library/artists/page')) return new Response(JSON.stringify({
      artists: { kim, lou: { id: 'lou', name: 'Lou (old)' } }, artistInfo: { kim: { albums: 0, fruit: 0 }, lou: { albums: 9, fruit: 9 } }, next: null }))
    if (url.startsWith('/api/library/artists/find')) return new Response(JSON.stringify({ artists: { joe }, artistInfo: { joe: { score: 1, albums: 1, fruit: 0 } } }))
    if (url.startsWith('/api/library/artists')) return new Response(JSON.stringify({ albums: {}, tracks: {} }))
    posts.push(JSON.parse(String(init?.body))); return new Response('{}')
  })) }

  test('the next page joins the store as already saved; artists already here stay as they are', async () => {
    serve()
    await startSync()
    expect(useArtistPages.getState().next).toBe('c1')
    await loadMoreArtists()
    expect(urls).toContain('/api/library/artists/page?after=c1')
    expect(Object.keys(useStore.getState().artists).sort()).toEqual(['kim', 'lou'])
    expect(useStore.getState().artists.lou.name).toBe('Lou')
    expect(useStore.getState().artistInfo.lou).toEqual({ score: 6, albums: 1, firstAdded: 50, fruit: 1 })
    expect(useArtistPages.getState().next).toBeNull()
    await loadMoreArtists() // no more pages
    expect(urls.filter(u => u.includes('/page'))).toHaveLength(1)
    await new Promise(r => setTimeout(r, 400))
    // (a save may still arrive from the test before's reset; none of it is these artists)
    const saved = (posts as { upsert: { artists: { id: string }[] } }[]).flatMap(p => p.upsert.artists.map(a => a.id))
    expect(saved).not.toContain('kim')
  })

  test('an artist not loaded yet is looked up before being matched, so they\'re never added twice', async () => {
    serve()
    await startSync()
    await loadArtistsFor([{ name: 'Joe', vendor: { name: 'spotify', id: 'joe-spotify' } }, { name: 'Lou' }])
    expect(urls.find(u => u.includes('/find'))).toBe('/api/library/artists/find?vendor=joe-spotify&name=Joe')
    expect(useStore.getState().artists.joe).toEqual(joe)
    expect(urls).toContain('/api/library/artists?ids=joe,lou')
    // added now, Joe's album goes to the Joe already in the database
    const albumId = useStore.getState().addAlbum({ name: 'First', vendor: { name: 'spotify', id: 'joe-album' }, artist: { name: 'Joe', vendor: { name: 'spotify', id: 'joe-spotify' } } })
    expect(useStore.getState().albums[albumId!].artistId).toBe('joe')
    // the same lookup isn't asked again
    await loadArtistsFor([{ name: 'Joe', vendor: { name: 'spotify', id: 'joe-spotify' } }])
    expect(urls.filter(u => u.includes('/find'))).toHaveLength(1)
    await new Promise(r => setTimeout(r, 400))
    // only the album is saved, not Joe again
    expect((posts as { upsert: { artists: { id: string }[], albums: { id: string }[] } }[]).flatMap(p => p.upsert.artists.map(a => a.id))).not.toContain('joe')
    expect((posts as { upsert: { albums: { id: string }[] } }[]).flatMap(p => p.upsert.albums.map(a => a.id))).toContain(albumId)
  })
})
