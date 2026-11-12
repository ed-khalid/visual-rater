import { beforeEach, describe, expect, test } from 'vitest'
import type { AlbumDetails } from '../shared/suggestions'
import { addedColumn, INCOMPLETE, positionOf, rating, ratingLabel, stagedAlbums, tracksByArtist, tracksOf, treeNodes, UNRATED_POSITION } from './board'
import { BRANCH_LENGTH, MAX_BRANCH_LENGTH, MIN_BRANCH_LENGTH } from './layout'
import { albumStatus, initialState, nameTaken, positionToScore, scoreToPosition, useStore } from './store'

const s = () => useStore.getState()
const spotify = (id: string) => ({ name: 'spotify' as const, id })
const details = (artist = 'Radiohead', n = 3): AlbumDetails => ({
  id: 'kida', name: 'Kid A', artist, artistId: 'rh', year: 2000, image: 'https://i.scdn.co/image/kida',
  tracks: Array.from({ length: n }, (_, i) => ({ id: `t${i + 1}`, name: `Track ${i + 1}`, number: i + 1, disc: 1, durationMs: 1000 })),
})
/** A staged album with its tracklist loaded. */
const stageKidA = (n = 3) => {
  s().openType('music')
  const id = s().addAlbum({ name: 'Kid A', vendor: spotify('kida'), artist: { name: 'Radiohead', vendor: spotify('rh') } })!
  s().setAlbumDetails(id, details('Radiohead', n))
  return id
}
const gap = (a: number, b: number) => { const d = Math.abs(a - b) % (2 * Math.PI); return Math.min(d, 2 * Math.PI - d) * 180 / Math.PI }

beforeEach(() => useStore.setState(initialState()))

describe('types', () => {
  test('starts on the type picker; opening a type opens its tree', () => {
    expect(s().activeType).toBeNull()
    s().openType('books')
    expect(s().activeType).toBe('books')
    s().closeBoard()
    expect(s().activeType).toBeNull()
  })
})

describe('typed entries', () => {
  test('need an open tree; go on it unrated, mid-trunk, as the right kind of thing', () => {
    expect(s().addTyped('Stalker')).toBeNull()
    s().openType('movies')
    const id = s().addTyped('  Stalker ')!
    expect(s().movies[id].name).toBe('Stalker')
    expect(s().movies[id].score).toBeUndefined()
    expect(positionOf(s().movies[id])).toBe(UNRATED_POSITION)
    s().openType('music')
    const track = s().addTyped('Demo Tape')!
    expect(s().tracks[track]).toMatchObject({ name: 'Demo Tape' })
    expect(s().tracks[track].albumId).toBeUndefined()
    expect(treeNodes(s(), 'music').map(n => n.id)).toEqual([track])
  })

  test('duplicates are per tree, ignoring case', () => {
    s().openType('books')
    s().addTyped('Dune')
    expect(s().addTyped('dune')).toBeNull()
    expect(nameTaken(s(), 'books', 'DUNE')).toBe(true)
    s().openType('movies')
    expect(s().addTyped('Dune')).not.toBeNull()
  })

  test('items at the same height point at least 60° apart', () => {
    s().openType('books')
    const ids = ['A', 'B', 'C'].map(n => s().addTyped(n)!)
    const [a, b, c] = ids.map(id => s().books[id].branch!.angle)
    expect(Math.min(gap(a, b), gap(a, c), gap(b, c))).toBeGreaterThanOrEqual(59.9)
    expect(s().books[ids[0]].branch!.length).toBe(BRANCH_LENGTH)
  })
})

describe('albums and artists', () => {
  test('a catalogue album goes to the staging tray with its artist; not twice', () => {
    const id = stageKidA()
    expect(stagedAlbums(s()).map(a => a.id)).toEqual([id])
    expect(albumStatus(s(), spotify('kida'))).toBe('staged')
    expect(s().addAlbum({ name: 'Kid A', vendor: spotify('kida') })).toBeNull()
    const artist = s().artists[s().albums[id].artistId!]
    expect(artist).toMatchObject({ name: 'Radiohead', vendor: spotify('rh') })
  })

  test('the tracklist becomes tracks (off the tree), once; the catalogue never overwrites what\'s there', () => {
    const id = stageKidA()
    expect(tracksOf(s(), id).map(t => t.name)).toEqual(['Track 1', 'Track 2', 'Track 3'])
    expect(treeNodes(s(), 'music')).toEqual([])
    s().editAlbum(id, { year: 1999 })
    s().setAlbumDetails(id, details('Someone Else', 5))
    expect(tracksOf(s(), id)).toHaveLength(3)
    expect(s().albums[id].year).toBe(1999)
  })

  test('an artist is matched by catalogue id, or by name when it has none (and gains the id)', () => {
    s().openType('music')
    const a1 = s().addAlbum({ name: 'A', vendor: spotify('a'), artist: { name: 'Radiohead' } })!
    const a2 = s().addAlbum({ name: 'B', vendor: spotify('b'), artist: { name: 'radiohead', vendor: spotify('rh') } })!
    const a3 = s().addAlbum({ name: 'C', vendor: spotify('c'), artist: { name: 'Radiohead (other)', vendor: spotify('rh') } })!
    const ids = [a1, a2, a3].map(id => s().albums[id].artistId)
    expect(new Set(ids).size).toBe(1)
    expect(Object.values(s().artists)).toEqual([expect.objectContaining({ name: 'Radiohead', vendor: spotify('rh') })])
  })
})

describe('adding an album\'s tracks', () => {
  test('its tracks go on the tree (unrated, in tracklist order); the album and its artist go to the added column', () => {
    const id = stageKidA()
    expect(s().addAlbumTracks(id)).toBe(3)
    const nodes = treeNodes(s(), 'music')
    expect(nodes.map(n => n.entity.name)).toEqual(['Track 1', 'Track 2', 'Track 3'])
    expect(nodes.every(n => n.entity.score === undefined)).toBe(true)
    expect(stagedAlbums(s())).toEqual([])
    expect(addedColumn(s())).toEqual([{ id, collection: 'albums' }, { id: s().albums[id].artistId, collection: 'artists' }])
    expect(albumStatus(s(), spotify('kida'))).toBe('added')
    expect(s().addAlbumTracks(id)).toBeNull()
  })

  test('deleted tracks stay out; renaming a track renames it on the tree', () => {
    const id = stageKidA()
    const [t1, , t3] = tracksOf(s(), id)
    s().editAlbum(id, { tracks: [{ id: t1.id, name: 'Everything In Its Right Place' }, { id: t3.id, name: t3.name }] })
    s().addAlbumTracks(id)
    expect(treeNodes(s(), 'music').map(n => `${s().tracks[n.id].number}.${n.entity.name}`)).toEqual(['1.Everything In Its Right Place', '2.Track 3'])
  })
})

describe('scores', () => {
  test('0 at the bottom of the trunk, 100 at the top; dragging sets a score', () => {
    expect([positionToScore(0), positionToScore(1), positionToScore(1.3)]).toEqual([0, 100, 100])
    expect(scoreToPosition(72.5)).toBeCloseTo(0.725)
    const id = stageKidA()
    s().addAlbumTracks(id)
    const [t1] = tracksOf(s(), id)
    expect(ratingLabel(s(), t1.id)).toBe('UNRATED')
    // stored 0–100, snapped to the 0–5 scale's 0.1 steps (2 points), shown on it
    s().move(t1.id, { position: 0.873 })
    expect(s().tracks[t1.id].score).toBe(88)
    expect(ratingLabel(s(), t1.id)).toBe('4.4')
  })

  test('album score is the average of its tracks once all are rated (Incomplete till then); artist score the v1 weighted count', () => {
    const id = stageKidA()
    s().addAlbumTracks(id)
    const [t1, t2, t3] = tracksOf(s(), id)
    const artistId = s().albums[id].artistId!
    expect(ratingLabel(s(), id)).toBe(INCOMPLETE)
    expect(ratingLabel(s(), artistId)).toBe('UNRATED')
    s().move(t1.id, { position: 0.96 }) // classic: 6
    s().move(t2.id, { position: 0.82 }) // good: 1
    // one still unrated: no album score, though the artist's counts what's rated
    expect(rating(s(), id)).toEqual({ label: INCOMPLETE })
    expect(ratingLabel(s(), artistId)).toBe('7.0')
    // a hidden unrated song doesn't hold it back
    s().remove(t3.id)
    expect(ratingLabel(s(), id)).toBe('4.45')
    expect(ratingLabel(s(), artistId)).toBe('7.0')
    // and their tiers: CLASSIC and GOOD tracks, an A+ album (89, 4.45), an E artist (7.0)
    expect([t1.id, t2.id, id, artistId].map(x => rating(s(), x).tier?.name)).toEqual(['CLASSIC', 'GOOD', 'A+', 'E'])
    expect(rating(s(), t1.id).tier?.color).toBe(rating(s(), id).tier?.color)
    expect(tracksByArtist(s(), artistId)).toHaveLength(3)
  })

  test('hiding a track keeps its score, and it still counts for its album', () => {
    const id = stageKidA()
    s().addAlbumTracks(id)
    const [t1, t2, t3] = tracksOf(s(), id)
    for (const t of [t1, t2, t3]) s().move(t.id, { position: 0.9 })
    s().remove(t1.id)
    expect(s().tracks[t1.id]).toMatchObject({ hidden: true, score: 90 })
    expect(treeNodes(s(), 'music').map(n => n.id)).not.toContain(t1.id)
    expect(ratingLabel(s(), id)).toBe('4.5')
  })
})

describe('moving fruit', () => {
  test('moving one never moves another; position and length are clamped', () => {
    s().openType('books')
    const ids = ['A', 'B', 'C', 'D'].map(n => s().addTyped(n)!)
    const others = () => ids.slice(1).map(id => s().books[id])
    const before = others()
    s().move(ids[0], { position: 0.9 })
    expect(others()).toEqual(before)
    s().move(ids[0], { length: 99 }); expect(s().books[ids[0]].branch!.length).toBe(MAX_BRANCH_LENGTH)
    s().move(ids[0], { length: 0 }); expect(s().books[ids[0]].branch!.length).toBe(MIN_BRANCH_LENGTH)
    s().move(ids[0], { position: -1 }); expect(s().books[ids[0]].score).toBe(0)
  })

  test('dropping onto a clashing spot turns only the moved branch', () => {
    s().openType('books')
    const a = s().addTyped('A')!
    s().move(a, { position: 0.2 })
    const b = s().addTyped('B')!
    const aBefore = s().books[a]
    useStore.setState({ books: { ...s().books, [b]: { ...s().books[b], branch: { ...aBefore.branch! } } } })
    s().move(b, { position: 0.2 })
    expect(s().books[a]).toEqual(aBefore)
    expect(gap(s().books[b].branch!.angle, aBefore.branch!.angle)).toBeGreaterThanOrEqual(59.9)
  })

  test('auto-align keeps every height and puts well-spaced fruit on the main plane', () => {
    s().openType('books')
    const ids = ['A', 'B', 'C'].map(n => s().addTyped(n)!)
    ids.forEach((id, i) => s().move(id, { position: 0.2 + i * 0.3 }))
    const scores = ids.map(id => s().books[id].score)
    s().autoAlignBoard()
    expect(ids.map(id => s().books[id].score)).toEqual(scores)
    expect(ids.every(id => Math.abs(Math.abs(Math.sin(s().books[id].branch!.angle)) - 1) < 1e-9)).toBe(true)
  })
})

describe('removing', () => {
  test('a movie or book is deleted', () => {
    s().openType('movies')
    const id = s().addTyped('Stalker')!
    s().remove(id)
    expect(s().movies[id]).toBeUndefined()
  })

  test('an album is deleted with its tracks, and its artist if nothing else of theirs is left', () => {
    const id = stageKidA()
    const artistId = s().albums[id].artistId!
    const other = s().addAlbum({ name: 'Amnesiac', vendor: spotify('amn'), artist: { name: 'Radiohead', vendor: spotify('rh') } })!
    s().remove(id)
    expect(s().albums[id]).toBeUndefined()
    expect(tracksOf(s(), id)).toEqual([])
    expect(s().artists[artistId]).toBeDefined() // still has Amnesiac
    s().remove(other)
    expect(s().artists[artistId]).toBeUndefined()
  })

  test('artists can\'t be removed directly', () => {
    const id = stageKidA()
    const artistId = s().albums[id].artistId!
    s().remove(artistId)
    expect(s().artists[artistId]).toBeDefined()
  })
})

describe('editing an album', () => {
  test('title, year and track names; blank ones and non-whole years are rejected without changes', () => {
    const id = stageKidA()
    const tracks = tracksOf(s(), id)
    expect(s().editAlbum(id, { name: ' Kid A (Remaster) ', year: 2001, tracks: tracks.map((t, i) => ({ id: t.id, name: i ? t.name : '  Idioteque ' })) })).toBe(true)
    expect(s().albums[id]).toMatchObject({ name: 'Kid A (Remaster)', year: 2001 })
    expect(tracksOf(s(), id)[0].name).toBe('Idioteque')
    const before = s().albums[id]
    expect(s().editAlbum(id, { name: '   ' })).toBe(false)
    expect(s().editAlbum(id, { year: 19.5 })).toBe(false)
    expect(s().editAlbum(id, { tracks: [{ id: tracks[0].id, name: ' ' }] })).toBe(false)
    expect(s().albums[id]).toBe(before)
    expect(s().editAlbum(id, { year: null })).toBe(true)
    expect(s().albums[id].year).toBeUndefined()
  })

  test('deleting tracks renumbers each disc from 1', () => {
    const id = stageKidA(4)
    const [t1, , t3, t4] = tracksOf(s(), id)
    s().editAlbum(id, { tracks: [t1, t3, t4].map(t => ({ id: t.id, name: t.name })) })
    expect(tracksOf(s(), id).map(t => `${t.number}:${t.name}`)).toEqual(['1:Track 1', '2:Track 3', '3:Track 4'])
  })

  test('short titles: made with each track, kept as typed, blank removes it, and a rename carries an automatic one along', () => {
    const id = stageKidA(3)
    const [t1, t2, t3] = tracksOf(s(), id)
    expect(t1.shortTitle).toBe('Track 1')
    s().editAlbum(id, { tracks: [{ id: t1.id, name: t1.name, shortTitle: '  Opener ' }, { id: t2.id, name: t2.name, shortTitle: ' ' }, { id: t3.id, name: t3.name }] })
    expect(tracksOf(s(), id).map(t => t.shortTitle)).toEqual(['Opener', undefined, 'Track 3'])
    expect('shortTitle' in s().tracks[t2.id]).toBe(false)
    s().editAlbum(id, { tracks: [{ id: t1.id, name: 'The Long Opening Song' }, { id: t2.id, name: t2.name }, { id: t3.id, name: 'Master of Puppets' }] })
    expect(tracksOf(s(), id).map(t => t.shortTitle)).toEqual(['Opener', undefined, 'Master'])
  })
})

describe('album directions (MUSIC)', () => {
  const plane = (angle: number) => { const a = ((angle - Math.PI / 2) % Math.PI + Math.PI) % Math.PI; return Math.round(a * 180 / Math.PI) % 180 }
  /** Compass direction of a branch in degrees: 90 = right of the trunk from the starting view, 270 = left. */
  const direction = (angle: number) => Math.round(((angle * 180 / Math.PI) % 360 + 360) % 360) % 360
  const directionsOf = (albumId: string) => new Set(tracksOf(s(), albumId).map(t => direction(t.branch!.angle)))
  const addOkc = () => {
    const okc = s().addAlbum({ name: 'OK Computer', vendor: spotify('okc'), artist: { name: 'Radiohead', vendor: spotify('rh') } })!
    s().setAlbumDetails(okc, { ...details('Radiohead', 4), id: 'okc', name: 'OK Computer',
      tracks: details('Radiohead', 4).tracks.map(t => ({ ...t, id: `okc-${t.id}` })) })
    s().addAlbumTracks(okc)
    return okc
  }

  test('an album\'s unrated tracks go outwards in tracklist order: track 1 has the shortest stem', () => {
    const kidA = stageKidA(5)
    s().addAlbumTracks(kidA)
    const lengths = () => tracksOf(s(), kidA).filter(t => t.score === undefined).map(t => t.branch!.length)
    const increasing = (ls: number[]) => ls.every((l, i) => i === 0 || l > ls[i - 1])
    expect(increasing(lengths())).toBe(true)
    // with another album on the tree too (each album one way), and after rating one of them, the rest stay in order
    const okc = addOkc()
    expect(increasing(lengths())).toBe(true)
    expect(increasing(tracksOf(s(), okc).map(t => t.branch!.length))).toBe(true)
    s().move(tracksOf(s(), kidA)[2].id, { position: 0.9 })
    s().autoAlignBoard()
    expect(lengths()).toHaveLength(4)
    expect(increasing(lengths())).toBe(true)
  })

  test('one album uses both sides of the main plane; with more, each album points one way, round the whole turn', () => {
    const kidA = stageKidA(4)
    s().addAlbumTracks(kidA)
    expect(new Set(tracksOf(s(), kidA).map(t => plane(t.branch!.angle)))).toEqual(new Set([0]))
    const okc = addOkc()
    expect([...directionsOf(kidA)]).toEqual([90])
    expect([...directionsOf(okc)]).toEqual([270])
    // and they stay that way after a drag re-aligns the tree
    s().move(tracksOf(s(), okc)[0].id, { position: 0.9 })
    s().autoAlignBoard()
    expect([...directionsOf(kidA)]).toEqual([90])
    expect([...directionsOf(okc)]).toEqual([270])
    // removing one hands the main plane back to the other, both sides
    s().remove(kidA)
    expect(new Set(tracksOf(s(), okc).map(t => plane(t.branch!.angle)))).toEqual(new Set([0]))
  })

  test('reset (flattenBoard) puts each album wholly left or right on the main plane, heights unchanged', () => {
    const kidA = stageKidA(4)
    s().addAlbumTracks(kidA)
    const okc = addOkc()
    s().move(tracksOf(s(), okc)[0].id, { position: 0.9 })
    s().autoAlignBoard()
    const scores = Object.values(s().tracks).map(t => t.score)
    s().flattenBoard()
    const a = directionsOf(kidA), b = directionsOf(okc)
    expect(a.size).toBe(1)
    expect(b.size).toBe(1)
    expect(new Set([...a, ...b])).toEqual(new Set([90, 270]))
    expect(Object.values(s().tracks).map(t => t.score)).toEqual(scores)
  })
})

describe('songs added on their own', () => {
  const song = (id: string, album = 'elsewhere') => ({ name: `Song ${id}`, vendor: spotify(id), album: spotify(album), artist: { name: 'Radiohead', vendor: spotify('rh') } })
  const misc = () => Object.values(s().albums).filter(a => a.misc)

  test('a song whose album isn\'t here goes on the artist\'s Misc album, on the tree, unrated, in the order added', () => {
    s().openType('music')
    const a = s().addSong(song('x1'))!, b = s().addSong(song('x2'))!
    expect(misc()).toHaveLength(1)
    expect(a.albumId).toBe(misc()[0].id)
    expect(b.albumId).toBe(a.albumId)
    expect(misc()[0]).toMatchObject({ name: 'Singles', addedAt: expect.any(Number), artistId: Object.keys(s().artists)[0] })
    const tracks = tracksOf(s(), a.albumId)
    expect(tracks.map(t => [t.name, t.number, t.score, !!t.branch])).toEqual([['Song x1', 1, undefined, true], ['Song x2', 2, undefined, true]])
    // and only one artist, however many songs
    expect(Object.keys(s().artists)).toHaveLength(1)
  })

  test('a song on an album here goes to that album: staged (to be put on the tree), or back on the tree if hidden', () => {
    const kida = stageKidA()
    expect(s().addSong(song('t2', 'kida'))).toEqual({ albumId: kida, staged: true })
    s().addAlbumTracks(kida)
    const t2 = Object.values(s().tracks).find(t => t.vendor?.id === 't2')!
    s().remove(t2.id)
    expect(s().tracks[t2.id].hidden).toBe(true)
    expect(s().addSong(song('t2', 'kida'))).toEqual({ albumId: kida })
    expect(s().tracks[t2.id].hidden).toBeFalsy()
    expect(misc()).toHaveLength(0)
  })

  test('when the song\'s album is added later, it moves there with its score, and an empty Misc goes', () => {
    s().openType('music')
    const { albumId } = s().addSong(song('t2', 'kida'))!
    const t = tracksOf(s(), albumId)[0]
    s().move(t.id, { position: 0.91 })
    const kida = s().addAlbum({ name: 'Kid A', vendor: spotify('kida'), artist: { name: 'Radiohead', vendor: spotify('rh') } })!
    s().setAlbumDetails(kida, details())
    expect(tracksOf(s(), kida).map(x => x.vendor?.id)).toEqual(['t1', 't2', 't3'])
    expect(s().tracks[t.id]).toMatchObject({ albumId: kida, number: 2, score: 92 })
    expect(misc()).toHaveLength(0)
  })
})

describe('songs typed with an artist (the ADD palette\'s form)', () => {
  const pic = 'data:image/jpeg;base64,AAAA'

  test('no album: on the artist\'s Misc album, on the tree, unrated, with its cover; a new artist is made once', () => {
    s().openType('music')
    const a = s().addTypedSong({ name: ' Demo ', artist: { name: 'Nobody Yet' }, image: pic })!
    const b = s().addTypedSong({ name: 'Demo 2', artist: { name: 'nobody yet' } })!
    expect(Object.values(s().artists).map(x => x.name)).toEqual(['Nobody Yet'])
    expect(b.albumId).toBe(a.albumId)
    expect(s().albums[a.albumId]).toMatchObject({ name: 'Singles', misc: true, addedAt: expect.any(Number) })
    expect(tracksOf(s(), a.albumId).map(t => [t.name, t.number, t.score, !!t.branch, t.image])).toEqual([
      ['Demo', 1, undefined, true, pic], ['Demo 2', 2, undefined, true, undefined]])
  })

  test('an album of theirs on the tree: after its last song, with its cover when none is given; a name already on it is refused', () => {
    const kida = stageKidA()
    s().addAlbumTracks(kida)
    const artist = s().albums[kida].artistId!
    const added = s().addTypedSong({ name: 'Untitled Jam', artist: { id: artist }, album: { id: kida } })!
    expect(added.albumId).toBe(kida)
    expect(s().tracks[added.trackId]).toMatchObject({ number: 4, disc: 1, image: 'https://i.scdn.co/image/kida', artistId: artist })
    expect(s().addTypedSong({ name: 'untitled jam', artist: { id: artist }, album: { id: kida } })).toBeNull()
  })

  test('a staged album is refused (it goes on the tree first); a new album name makes an album with the cover', () => {
    const kida = stageKidA()
    const artist = s().albums[kida].artistId!
    expect(s().addTypedSong({ name: 'X', artist: { id: artist }, album: { id: kida } })).toBeNull()
    const added = s().addTypedSong({ name: 'X', artist: { id: artist }, album: { name: 'Bootlegs' }, image: pic })!
    expect(s().albums[added.albumId]).toMatchObject({ name: 'Bootlegs', artistId: artist, image: pic, addedAt: expect.any(Number), tracklistLoaded: true })
    expect(s().albums[added.albumId].misc).toBeUndefined()
    // typed again by name: the same album
    expect(s().addTypedSong({ name: 'Y', artist: { id: artist }, album: { name: 'bootlegs' } })!.albumId).toBe(added.albumId)
    expect(s().addTypedSong({ name: 'Z', artist: { id: 'nope' } })).toBeNull()
  })
})

describe('unrating', () => {
  test('a rated song loses its score and stays on the tree; an album\'s score shows to two decimals', () => {
    const kida = stageKidA()
    s().addAlbumTracks(kida)
    const [a, b, c] = tracksOf(s(), kida)
    s().move(a.id, { position: 0.7 })
    s().move(b.id, { position: 0.76 })
    s().remove(c.id)
    // 70 and 76: 73 stored, 3.65 shown
    expect(rating(s(), kida).label).toBe('3.65')
    s().unrate(a.id)
    expect(s().tracks[a.id].score).toBeUndefined()
    expect(s().tracks[a.id].branch).toBeDefined()
    expect(rating(s(), a.id).label).toBe('UNRATED')
    // a song unrated again: the album is Incomplete till it's rated
    expect(rating(s(), kida).label).toBe(INCOMPLETE)
  })
})

describe('not a song', () => {
  const withSkit = () => {
    s().openType('music')
    const id = s().addAlbum({ name: 'Kid A', vendor: spotify('kida'), artist: { name: 'Radiohead', vendor: spotify('rh') } })!
    const d = details('Radiohead', 3)
    d.tracks[1] = { ...d.tracks[1], name: 'Paul - Skit' }
    s().setAlbumDetails(id, d)
    s().addAlbumTracks(id)
    return id
  }

  test('a skit is marked when it\'s added: off the rater, and the album is complete without it', () => {
    const id = withSkit()
    const [a, skit, c] = tracksOf(s(), id)
    expect([a.notASong, skit.notASong, c.notASong]).toEqual([undefined, true, undefined])
    expect(treeNodes(s(), 'music').map(n => n.id)).toEqual([a.id, c.id])
    s().move(a.id, { position: 0.8 })
    s().move(c.id, { position: 0.9 })
    expect(ratingLabel(s(), id)).toBe('4.25')
    expect(ratingLabel(s(), skit.id)).toBe('NOT A SONG')
  })

  test('marked or unmarked in EDIT; a score it had is kept but counts for nothing while it\'s marked', () => {
    const id = withSkit()
    const [a, skit, c] = tracksOf(s(), id)
    const edit = (notASong: boolean) => s().editAlbum(id, { tracks: tracksOf(s(), id).map(t => ({ id: t.id, name: t.name, notASong: t.id === skit.id ? notASong : undefined })) })
    edit(false)
    expect(s().tracks[skit.id].notASong).toBeUndefined()
    for (const t of [a, skit, c]) s().move(t.id, { position: t.id === skit.id ? 0.2 : 0.8 })
    expect(ratingLabel(s(), id)).toBe('3')
    edit(true)
    expect(s().tracks[skit.id]).toMatchObject({ notASong: true, score: 20 })
    expect(ratingLabel(s(), id)).toBe('4')
    expect(ratingLabel(s(), s().albums[id].artistId!)).toBe('2.0')
  })
})

describe('live', () => {
  test('a live recording of a song the artist has counts for its album, not the artist; EDIT can change it', () => {
    const kida = stageKidA(1)
    s().addAlbumTracks(kida)
    const [studio] = tracksOf(s(), kida)
    const live = s().addAlbum({ name: 'I Might Be Wrong', vendor: spotify('imbw'), artist: { name: 'Radiohead', vendor: spotify('rh') } })!
    s().setAlbumDetails(live, { ...details('Radiohead', 2), id: 'imbw', name: 'I Might Be Wrong',
      tracks: [{ id: 'l1', name: 'Track 1 - Live', number: 1, disc: 1, durationMs: 1000 }, { id: 'l2', name: 'True Love Waits - Live', number: 2, disc: 1, durationMs: 1000 }] })
    s().addAlbumTracks(live)
    const [repeat, original] = tracksOf(s(), live)
    expect([repeat.live, original.live]).toEqual([true, undefined])
    for (const t of [studio, repeat, original]) s().move(t.id, { position: 0.96 })
    expect(ratingLabel(s(), live)).toBe('4.8')
    // the studio song and the one only out live: 6 each
    expect(ratingLabel(s(), s().albums[kida].artistId!)).toBe('12.0')
    s().editAlbum(live, { tracks: tracksOf(s(), live).map(t => ({ id: t.id, name: t.name, live: false })) })
    expect(ratingLabel(s(), s().albums[kida].artistId!)).toBe('18.0')
  })
})

describe('setImage (a picture uploaded in an overview)', () => {
  beforeEach(() => useStore.setState(initialState()))

  test('puts the new picture on an album or artist and drops their stored colours, to be worked out again', () => {
    const s = useStore.getState
    const id = s().addAlbum({ name: 'Kid A', image: 'https://i.scdn.co/image/old', vendor: { name: 'spotify', id: 'kida' }, artist: { name: 'Radiohead' } })!
    const artistId = s().albums[id].artistId!
    s().setColors(id, ['#123456'])
    const pic = 'data:image/jpeg;base64,/9j/4AAQ'
    s().setImage(id, pic)
    expect(s().albums[id]).toMatchObject({ image: pic, name: 'Kid A' })
    expect(s().albums[id].colors).toBeUndefined()
    // its songs get it too
    s().setAlbumDetails(id, details('Radiohead', 3))
    s().setImage(id, pic + 'x')
    expect(tracksOf(s(), id).map(t => t.image)).toEqual([pic + 'x', pic + 'x', pic + 'x'])
    s().setImage(artistId, pic)
    expect(s().artists[artistId].image).toBe(pic)
    s().setImage('nothing', pic) // no such thing: nothing happens
  })
})

describe('artists and albums made by hand', () => {
  beforeEach(() => { useStore.setState(initialState()); s().openType('music') })

  test('an artist typed in is made once; typing their name again finds them', () => {
    const id = s().addArtist('  Sherine ')!
    expect(s().artists[id]).toEqual({ id, name: 'Sherine' })
    expect(s().addArtist('sherine')).toBe(id)
    expect(Object.keys(s().artists)).toHaveLength(1)
    expect(s().addArtist('   ')).toBeNull()
  })

  test('an album made on an artist\'s overview goes on the tree with its songs unrated, in order', () => {
    const artist = s().addArtist('Sherine')!
    const id = s().createAlbum(artist, { name: 'Garh Tany', year: 2003, image: 'https://example.com/c.jpg', tracks: ['Sabri Alil', '', '  Ana Fi  ', 'Intro Skit'] })!
    expect(s().albums[id]).toMatchObject({ name: 'Garh Tany', artistId: artist, year: 2003, image: 'https://example.com/c.jpg', tracklistLoaded: true })
    expect(s().albums[id].addedAt).toBeDefined()
    expect(s().albums[id].vendor).toBeUndefined()
    const tracks = tracksOf(s(), id)
    expect(tracks.map(t => [t.number, t.name, t.score, !!t.branch, t.artistId])).toEqual([
      [1, 'Sabri Alil', undefined, true, artist], [2, 'Ana Fi', undefined, true, artist], [3, 'Intro Skit', undefined, true, artist]])
    expect(tracks[2].notASong).toBe(true)
    expect(ratingLabel(s(), id)).toBe(INCOMPLETE)
    // the same title again, a blank one, or no such artist: nothing
    expect(s().createAlbum(artist, { name: 'garh tany', tracks: [] })).toBeNull()
    expect(s().createAlbum(artist, { name: ' ', tracks: [] })).toBeNull()
    expect(s().createAlbum('nobody', { name: 'X', tracks: [] })).toBeNull()
    // no songs yet is fine: they're added from album view
    const empty = s().createAlbum(artist, { name: 'Later', tracks: [] })!
    expect(s().albums[empty].addedAt).toBeDefined()
  })
})

describe('moveAlbum (EDIT: the album\'s artist)', () => {
  beforeEach(() => { useStore.setState(initialState()); s().openType('music') })

  test('the album and its songs go to the artist picked; the one it leaves goes if nothing of theirs is left', () => {
    const wrong = s().addArtist('Shereen')!, right = s().addArtist('Sherine')!
    const id = s().createAlbum(wrong, { name: 'Garh Tany', tracks: ['One', 'Two'] })!
    s().move(tracksOf(s(), id)[0].id, { position: 0.9 })
    expect(s().moveAlbum(id, { id: right })).toBe(id)
    expect(s().albums[id].artistId).toBe(right)
    expect(tracksOf(s(), id).map(t => [t.artistId, t.score !== undefined])).toEqual([[right, true], [right, false]])
    expect(s().artists[wrong]).toBeUndefined()
  })

  test('to a new artist by name, or one here by that name; an artist with other albums stays', () => {
    const a = s().addArtist('A')!
    const one = s().createAlbum(a, { name: 'One', tracks: ['x'] })!, two = s().createAlbum(a, { name: 'Two', tracks: ['y'] })!
    s().moveAlbum(one, { name: 'Brand New' })
    const b = s().albums[one].artistId!
    expect(s().artists[b].name).toBe('Brand New')
    expect(s().artists[a]).toBeDefined() // still has Two
    s().moveAlbum(two, { name: 'brand new' })
    expect(s().albums[two].artistId).toBe(b)
    expect(s().artists[a]).toBeUndefined()
    expect(s().moveAlbum(two, { id: 'nobody' })).toBeNull()
  })

  test('Misc moved to an artist who has one already joins theirs', () => {
    const a = s().addArtist('A')!, b = s().addArtist('B')!
    s().addTypedSong({ name: 'Loose A', artist: { id: a } })
    s().addTypedSong({ name: 'Loose B', artist: { id: b } })
    const miscA = Object.values(s().albums).find(x => x.misc && x.artistId === a)!.id
    const miscB = Object.values(s().albums).find(x => x.misc && x.artistId === b)!.id
    expect(s().moveAlbum(miscA, { id: b })).toBe(miscB)
    expect(s().albums[miscA]).toBeUndefined()
    expect(tracksOf(s(), miscB).map(t => [t.number, t.name, t.artistId])).toEqual([[1, 'Loose B', b], [2, 'Loose A', b]])
  })
})
