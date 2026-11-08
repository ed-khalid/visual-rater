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
