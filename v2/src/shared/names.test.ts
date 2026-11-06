import { describe, expect, test } from 'vitest'
import { cleanName } from './names'

describe('cleanName (edition tags)', () => {
  test('strips edition tags at the end, in brackets or after a dash', () => {
    expect(cleanName('Master of Puppets (Remastered Deluxe Box Set)')).toEqual({ name: 'Master of Puppets', edition: 'Remastered Deluxe Box Set' })
    expect(cleanName('Battery - Remastered')).toEqual({ name: 'Battery', edition: 'Remastered' })
    expect(cleanName('Fade To Black - 2016 Remaster')).toEqual({ name: 'Fade To Black', edition: '2016 Remaster' })
    expect(cleanName('OK Computer OKNOTOK 1997 2017 [Remastered]').name).toBe('OK Computer OKNOTOK 1997 2017')
    expect(cleanName('Rumours (Super Deluxe) [2021 Remaster]')).toEqual({ name: 'Rumours', edition: 'Super Deluxe · 2021 Remaster' })
    expect(cleanName('Nevermind (30th Anniversary Edition)').name).toBe('Nevermind')
    expect(cleanName('Dookie (Expanded Edition) ').name).toBe('Dookie')
    expect(cleanName('Kid A (Bonus Tracks)').name).toBe('Kid A')
  })

  test('leaves real titles and other versions alone', () => {
    for (const n of ['Welcome Home (Sanitarium)', '(Anesthesia)--Pulling Teeth', 'Song 2 (Live)', 'Everlong (Acoustic)', 'Creep (Radio Edit)',
      'Hey Ya! (feat. Someone)', 'Pyramid Song - Remix', 'Seek & Destroy', 'Re-Arranged', 'The Deluxe Room', 'Remastered'])
      expect(cleanName(n)).toEqual({ name: n })
  })

  test('never strips a name down to nothing', () => {
    expect(cleanName('(Remastered)')).toEqual({ name: '(Remastered)' })
  })
})
