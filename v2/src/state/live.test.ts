import { describe, expect, test } from 'vitest'
import type { Album, Track } from '../shared/model'
import { looksLive, songKey } from '../shared/names'
import { markLive } from './live'

const albums: Record<string, Album> = {
  mop: { id: 'mop', name: 'Master Of Puppets', artistId: 'm', tracklistLoaded: true, stagedAt: 1 },
  sm: { id: 'sm', name: 'S&M', artistId: 'm', tracklistLoaded: true, stagedAt: 2 },
  unp: { id: 'unp', name: 'MTV Unplugged In New York', artistId: 'n', tracklistLoaded: true, stagedAt: 3 },
}
const track = (id: string, name: string, albumId: string, artistId = 'm'): Track => ({ id, name, albumId, artistId })

describe('live recordings', () => {
  test('known by a live tag, or an album named as a live one; matched by name without the tag', () => {
    expect(['Battery - Live with the SFSO', 'Polly (Live)', 'Dumb [Live at Pier 48]', 'Battery', 'Live Forever', 'Alive'].map(n => looksLive(n)))
      .toEqual([true, true, true, false, false, false])
    expect([looksLive('Polly', 'MTV Unplugged In New York'), looksLive('Doll Parts', 'Live Through This')]).toEqual([true, false])
    expect(['- Human - Live with the SFSO', "Devil's Dance (Live)", 'Battery'].map(songKey)).toEqual(['human', 'devilsdance', 'battery'])
  })

  test('a live album added after the studio one: its repeats are marked, its covers and new songs aren\'t', () => {
    const tracks = { b: track('b', 'Battery', 'mop'), lb: track('lb', 'Battery - Live with the SFSO', 'sm'),
      nlc: track('nlc', 'No Leaf Clover - Live with the SFSO', 'sm'), eog: track('eog', 'The Ecstasy Of Gold - Live with the SFSO', 'sm') }
    const out = markLive(albums, tracks, ['lb', 'nlc', 'eog'])
    expect([out.b.live, out.lb.live, out.nlc.live, out.eog.live]).toEqual([undefined, true, undefined, undefined])
  })

  test('the studio album added after the live one marks the live recordings it matches', () => {
    const tracks = { lb: track('lb', 'Battery - Live with the SFSO', 'sm'), b: track('b', 'Battery', 'mop') }
    expect(markLive(albums, tracks, ['b']).lb.live).toBe(true)
  })

  test('another artist\'s song of the same name is a cover, not a repeat; nothing added, nothing changes', () => {
    const tracks = { b: track('b', 'Battery', 'mop'), nb: track('nb', 'Battery - Live', 'unp', 'n') }
    expect(markLive(albums, tracks, ['nb']).nb.live).toBeUndefined()
    expect(markLive(albums, tracks, [])).toBe(tracks)
  })
})
