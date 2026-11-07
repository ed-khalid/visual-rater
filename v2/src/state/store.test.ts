import { beforeEach, describe, expect, test } from 'vitest'
import type { AlbumDetails } from '../shared/suggestions'
import { addedColumn, positionOf, rating, ratingLabel, stagedAlbums, tracksByArtist, tracksOf, treeNodes, UNRATED_POSITION } from './board'
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
    s().move(t1.id, { position: 0.873 })
    expect(s().tracks[t1.id].score).toBeCloseTo(87.3)
    expect(ratingLabel(s(), t1.id)).toBe('87')
  })

  test('album score is the average of its rated tracks; artist score the v1 weighted count', () => {
    const id = stageKidA()
    s().addAlbumTracks(id)
    const [t1, t2] = tracksOf(s(), id)
    const artistId = s().albums[id].artistId!
    expect(ratingLabel(s(), id)).toBe('UNRATED')
    expect(ratingLabel(s(), artistId)).toBe('UNRATED')
    s().move(t1.id, { position: 0.96 }) // classic: 6
    s().move(t2.id, { position: 0.82 }) // good: 1
    expect(ratingLabel(s(), id)).toBe('89')
    expect(ratingLabel(s(), artistId)).toBe('7.0')
    // and their tiers: CLASSIC and GOOD tracks, an A+ album (89), an E artist (7.0)
    expect([t1.id, t2.id, id, artistId].map(x => rating(s(), x).tier?.name)).toEqual(['CLASSIC', 'GOOD', 'A+', 'E'])
    expect(rating(s(), t1.id).tier?.color).toBe(rating(s(), id).tier?.color)
    expect(tracksByArtist(s(), artistId)).toHaveLength(3)
  })

  test('hiding a track keeps its score, and it still counts for its album', () => {
    const id = stageKidA()
    s().addAlbumTracks(id)
    const [t1] = tracksOf(s(), id)
    s().move(t1.id, { position: 0.9 })
    s().remove(t1.id)
    expect(s().tracks[t1.id]).toMatchObject({ hidden: true, score: 90 })
    expect(treeNodes(s(), 'music').map(n => n.id)).not.toContain(t1.id)
    expect(ratingLabel(s(), id)).toBe('90')
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
