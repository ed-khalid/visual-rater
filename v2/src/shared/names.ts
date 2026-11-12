/**
 * Catalogue names come with edition tags we don't want saved: "Master of Puppets (Remastered Deluxe Box Set)",
 * "Battery - Remastered". `cleanName` strips them, but only a tag at the end of the name, in (…), […] or after
 * " - ", and only if it names an edition (EDITION_WORDS). Anything else stays: "Welcome Home (Sanitarium)" is the
 * real title, and (Live), (Remix), (Acoustic), (Radio Edit) and (feat. …) are different recordings or credits.
 */
const EDITION_WORDS = /\b(re-?master(ed|s)?|deluxe|expanded|anniversary|edition|bonus tracks?|reissue[ds]?|box set)\b/i

const BRACKETED = /\s*[([]([^()[\]]*)[)\]]\s*$/
const DASHED = /\s+[-–—]\s+([^-–—]+)$/

/** The name without its edition tags, and the tags removed (joined, in their original order), if any. */
export const cleanName = (raw: string): { name: string, edition?: string } => {
  let name = raw.trim()
  const removed: string[] = []
  for (;;) {
    const m = name.match(BRACKETED) ?? name.match(DASHED)
    if (!m || !EDITION_WORDS.test(m[1])) break
    const rest = name.slice(0, m.index).trim()
    if (!rest) break
    removed.unshift(m[1].trim())
    name = rest
  }
  return removed.length ? { name, edition: removed.join(' · ') } : { name }
}

/** Longest a short title can be (the database and the API check it too). */
export const SHORT_TITLE_MAX = 40

/** Little words a short title doesn't start or end on. */
const FILLER = new Set(['a', 'an', 'the', 'of', 'and', 'or', 'to', 'in', 'on', 'at', 'for', 'from', 'by', 'with', 'is', 'that', 'it', '&'])

/**
 * One or two words to stand for a track on the rater, where the full title is clutter: "Master of Puppets" →
 * "Master", "The Thing That Should Not Be" → "Thing", "Welcome Home (Sanitarium)" → "Welcome Home",
 * "Damage, Inc." → "Damage Inc". The first two words, leaving out anything bracketed or after " - ", a leading
 * "The"/"A", and little words at the end. Titles of one or two words stay as they are.
 */
export const shortTitle = (name: string): string => {
  const main = name.replace(/\s*[([].*$/, '').replace(/\s+[-–—]\s+.*$/, '').trim() || name.trim()
  const words = main.split(/\s+/).map(w => w.replace(/^[^\p{L}\p{N}&]+|[^\p{L}\p{N}&']+$/gu, '')).filter(Boolean)
  if (words.length === 0) return name.trim().slice(0, SHORT_TITLE_MAX)
  if (words.length <= 2) return words.join(' ').slice(0, SHORT_TITLE_MAX)
  let start = 0
  while (start < words.length - 1 && /^(the|a|an)$/i.test(words[start])) start++
  const picked = words.slice(start, start + 2)
  while (picked.length > 1 && FILLER.has(picked[picked.length - 1].toLowerCase())) picked.pop()
  return picked.join(' ').slice(0, SHORT_TITLE_MAX)
}

/** Whether a track's name says it's a skit ("Paul - Skit", "Skit #2"): it's marked not a song when it's added (Track.notASong). */
export const isSkit = (name: string) => /\bskits?\b/i.test(name)

/** A live tag at the end of a track's name: "Battery - Live with the SFSO", "Polly (Live)", "Dumb [Live at …]". */
const LIVE_TAG = /(\s+-\s+[^-]*\blive\b.*|\s*[([][^)\]]*\blive\b[^)\]]*[)\]])\s*$/i
/**
 * An album named as a live one: "MTV Unplugged In New York", "Live at Wembley", "Alive (Live)". Not just the word
 * Live, which starts studio titles too ("Live Through This").
 */
const LIVE_ALBUM = /\bunplugged\b|\blive (at|in|from|on)\b|[([]live\b|\bin concert\b/i

/** Whether a track looks like a live recording, by its name or its album's. */
export const looksLive = (trackName: string, albumName = '') => LIVE_TAG.test(trackName) || LIVE_ALBUM.test(albumName)

/**
 * What a song is called, for matching a live recording with the studio one: the name without a live tag, lowercase,
 * letters and digits only ("- Human - Live with the SFSO" → "human"). The migration 007 backfill does the same in SQL.
 */
export const songKey = (name: string) => name.replace(LIVE_TAG, '').toLowerCase().replace(/[^a-z0-9]/g, '')
