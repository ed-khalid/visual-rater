import type { Album } from '../shared/model'

/**
 * The Misc album's cover: black, with SINGLES across it in white. Drawn here, never stored (Misc has no `image`), and
 * worn by its songs that have no picture of their own. SVG in an <img> can't use the page's fonts, so it names
 * Inter and falls back to the system sans.
 */
export const MISC_COVER = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
  + '<rect width="100" height="100" fill="#141210"/>'
  + '<text x="50" y="50" dy="0.35em" text-anchor="middle" fill="#fff" font-family="Inter, Helvetica, Arial, sans-serif" '
  + 'font-size="15" font-weight="700" letter-spacing="2">SINGLES</text></svg>')}`

/** An album's cover: its own picture, or Misc's drawn one. */
export const albumCover = (album: Pick<Album, 'image' | 'misc'> | undefined) => album?.image ?? (album?.misc ? MISC_COVER : undefined)

/** A song's cover: its own picture, or its album's (Misc's drawn one on Misc). */
export const trackCover = (track: { image?: string }, album: Pick<Album, 'image' | 'misc'> | undefined) =>
  track.image ?? albumCover(album)
