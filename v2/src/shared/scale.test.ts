import { describe, expect, test } from 'vitest'
import { isSkit } from './names'
import { FIVE, formatPrecise, formatScore, HUNDRED, roundToShown, snapScore, tierSteps, toShown, toStored, TRACK_TIERS } from './scale'

describe('score scales (stored 0–100, shown on the scale)', () => {
  test('0–5 in steps of 0.1: shown, stored and snapped', () => {
    expect([0, 50, 79.88, 100].map(s => formatScore(s, FIVE))).toEqual(['0.0', '2.5', '4.0', '5.0'])
    expect(toShown(71.43, FIVE)).toBeCloseTo(3.5715)
    expect(toStored(3.7, FIVE)).toBe(74)
    expect([79.88, 75, 74.9, 0.4].map(s => snapScore(s, FIVE))).toEqual([80, 76, 74, 0])
    expect(roundToShown(93, FIVE)).toBe(94)
    expect(formatPrecise(71.43, 2, FIVE)).toBe('3.57')
  })

  test('0–100 is continuous: shown whole, kept where it was let go', () => {
    expect(formatScore(84.5, HUNDRED)).toBe('85')
    expect(snapScore(84.5, HUNDRED)).toBe(84.5)
  })

  test('the tiers in use are stored 0–100, and the rubric reads the steps each covers', () => {
    expect(TRACK_TIERS.map(t => t.from)).toEqual(FIVE.tiers.map(t => t.from * 20))
    const steps = tierSteps(FIVE)
    expect(steps.map(t => `${t.name} ${t.range}`)).toEqual([
      'CLASSIC 4.7–5.0', 'GREAT 4.5–4.6', 'GOOD 4.0–4.4', 'PLEASANT 3.8–3.9', 'INTERESTING 3.5–3.7', 'OK 3.0–3.4',
      'AVERAGE 2.5–2.9', 'BAD 0.5–2.4', 'OFFENSIVE 0.0–0.4',
    ])
    expect(tierSteps(HUNDRED)[0].range).toBe('95–100')
  })
})

test('skits are known by name', () => {
  expect(['Paul - Skit', 'Skit #2', 'Skits', 'Intro', 'Skittles'].map(isSkit)).toEqual([true, true, true, false, false])
})
