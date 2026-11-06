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
