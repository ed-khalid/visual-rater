import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { SCALE, toStored } from '../shared/scale'
import { formatScore, songTier } from '../state/board'
import './albumChart.css'

/** `notASong` (a skit…): keeps its place on x, the line running through it at the average of the songs' scores, no dot. */
export type ChartTrack = { id: string, name: string, number: number, disc: number, score?: number, notASong?: boolean }

const HEIGHT = 150
const PAD = { top: 12, right: 14, bottom: 24, left: 30 }
/** The score axis's labels: where the scale in use puts them, at their stored height. */
const Y_TICKS = SCALE.chartTicks.map(t => ({ at: toStored(t), label: String(t) }))
/** How long the line takes to draw itself in, left to right, when the chart opens on an album. */
const DRAW_MS = 1200
const easeInOut = (p: number) => p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2

/**
 * Album view: the album's song scores as a line, in tracklist order (disc, then track number). x is the track
 * number (with a disc marker between discs), y the score on the scale in use (shared/scale.ts). Each rated song is a dot in
 * its tier's colour; unrated songs leave a gap in the line; a track that's not a song (a skit…) keeps its place, the
 * line running through it at the songs' average, with no dot. Hover (or touch) for a crosshair and the song's name,
 * score and tier. When it opens on an album, the line draws itself in from left to right (not again when a score changes).
 */
export const AlbumChart = ({ tracks, title = 'Flow', describe = 'Flow: song scores by track number', xLabel, colorOf, format = formatScore }: {
  tracks: ChartTrack[]
  /** The chart's heading; and what it shows, for screen readers. */
  title?: string, describe?: string
  /** Each point's label on x (default: its track number, disc-track on multi-disc albums). */
  xLabel?: (t: ChartTrack) => string
  /** Each dot's colour (default: the song tier's); and its tier's name and colour in the tip. */
  colorOf?: (score: number) => { name: string, color: string }
  /** How a score reads in the tip and for screen readers (default: a song's, rounded). */
  format?: (score: number) => string
}) => {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Draw-in: a clip over the line and dots that widens from the left. Set by hand each frame (React leaves the
  // rect's width alone), so re-renders mid-way don't restart it. It restarts only for another album's tracks.
  const clipId = useId()
  const clip = useRef<SVGRectElement>(null)
  const album = tracks[0]?.id ?? ''
  const ready = width > 0
  useLayoutEffect(() => {
    const rect = clip.current
    if (!rect) return
    const full = () => rect.setAttribute('width', '100%')
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return full()
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DRAW_MS)
      if (p >= 1) return full()
      const el = box.current, w = el ? el.clientWidth : 0
      // From just left of the first dot to just past the last, so each dot shows as the line reaches it.
      rect.setAttribute('width', String(PAD.left - 6 + easeInOut(p) * (w - PAD.left - PAD.right + 12)))
      frame = requestAnimationFrame(tick)
    }
    rect.setAttribute('width', '0')
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); full() }
  }, [album, ready])

  const n = tracks.length
  const innerW = Math.max(0, width - PAD.left - PAD.right), innerH = HEIGHT - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (score: number) => PAD.top + (1 - score / 100) * innerH
  const multiDisc = new Set(tracks.map(t => t.disc)).size > 1

  // Where the line passes a track that's not a song: the average of the rated songs (none rated: a gap, as unrated).
  const songScores = tracks.filter(t => !t.notASong && t.score !== undefined).map(t => t.score!)
  const average = songScores.length ? songScores.reduce((a, b) => a + b, 0) / songScores.length : undefined
  const lineAt = (t: ChartTrack) => t.notASong ? average : t.score
  // The line, broken wherever a song is unrated.
  const segments: string[] = []
  let run: string[] = []
  tracks.forEach((t, i) => {
    const v = lineAt(t)
    if (v === undefined) { if (run.length) segments.push(run.join(' ')); run = []; return }
    run.push(`${run.length ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
  })
  if (run.length) segments.push(run.join(' '))

  // Track labels on x: every one if they fit, otherwise every few.
  const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 22))))

  const pick = (clientX: number) => {
    const el = box.current
    if (!el || n === 0) return
    const px = clientX - el.getBoundingClientRect().left
    const i = n <= 1 ? 0 : Math.round(((px - PAD.left) / innerW) * (n - 1))
    setHover(Math.min(n - 1, Math.max(0, i)))
  }

  const h = hover !== null ? tracks[hover] : undefined
  const tierOf = colorOf ?? songTier
  const tier = h?.score !== undefined && !h.notASong ? tierOf(h.score) : undefined
  const label = xLabel ?? ((t: ChartTrack) => multiDisc ? `${t.disc}-${t.number}` : String(t.number))

  return <figure className="album-chart" aria-label={describe}>
    <figcaption className="album-chart-title">{title}</figcaption>
    <div ref={box} className="album-chart-plot"
      onPointerMove={e => pick(e.clientX)} onPointerDown={e => pick(e.clientX)} onPointerLeave={() => setHover(null)}>
      {width > 0 && <svg width={width} height={HEIGHT} role="img"
        aria-label={tracks.map(t => `${label(t)} ${t.name}: ${t.notASong ? 'not a song' : t.score !== undefined ? format(t.score) : 'unrated'}`).join('; ')}>
        {Y_TICKS.map(v => <g key={v.at}>
          <line className={`album-chart-grid${v.at === 0 ? ' base' : ''}`} x1={PAD.left} x2={width - PAD.right} y1={y(v.at)} y2={y(v.at)} />
          <text className="album-chart-tick" x={PAD.left - 8} y={y(v.at)} textAnchor="end" dominantBaseline="middle">{v.label}</text>
        </g>)}
        {tracks.map((t, i) => (i % every === 0 || i === n - 1) &&
          <text key={t.id} className="album-chart-tick" x={x(i)} y={HEIGHT - 6} textAnchor="middle">{label(t)}</text>)}
        {h && <line className="album-chart-cross" x1={x(hover!)} x2={x(hover!)} y1={PAD.top} y2={PAD.top + innerH} />}
        <clipPath id={clipId}><rect ref={clip} x={0} y={-10} height={HEIGHT + 20} /></clipPath>
        <g clipPath={`url(#${clipId})`}>
          {segments.map((d, i) => <path key={i} className="album-chart-line" d={d} />)}
          {tracks.map((t, i) => t.score !== undefined && !t.notASong &&
            <circle key={t.id} className="album-chart-dot" cx={x(i)} cy={y(t.score)} r={hover === i ? 5.5 : 4}
              style={{ fill: tierOf(t.score).color }} />)}
        </g>
      </svg>}
      {h && <div className="album-chart-tip" style={{
        left: Math.min(Math.max(x(hover!), 70), width - 70),
        top: lineAt(h) !== undefined ? y(lineAt(h)!) : PAD.top + innerH / 2,
      }}>
        <div className="album-chart-tip-name">{label(h)} · {h.name}</div>
        <div className="album-chart-tip-value">
          {h.notASong ? 'NOT A SONG' : h.score !== undefined ? format(h.score) : 'UNRATED'}
          {tier && <><span className="album-chart-tip-swatch" style={{ background: tier.color }} />{tier.name}</>}
        </div>
      </div>}
    </div>
  </figure>
}
