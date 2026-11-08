import { AnimatePresence, motion, MotionConfig, Reorder, useDragControls } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { rating, ratingFocus as focusOf, songTier, treeNodes } from '../state/board'
import { albumNodes, artistNodes } from '../state/drill'
import { labelWidth, type Piece, type Placed, placePieces, reachOf } from '../state/place'
import { raterKey, SINGLES, splitLayout } from '../state/split'
import { positionToScore, usePersisted, useStore } from '../state/store'
import type { Track } from '../shared/model'
import { registerAnchor, useAnchor, useAnchorLoop } from './anchors'
import { useGlow } from './useGlow'
import {
  collapse, COLLAPSE_SECONDS, isSplit, LEVEL_DELAY_MS, liveScores, raterBottomAnchor, raterNow, raterTopAnchor,
  TRUNK_BOTTOM_ANCHOR, TRUNK_TOP_ANCHOR, useView,
} from './view'
import './board.css'

/** A press that moves further than this (px) is a drag, not a tap. */
const CLICK_SLOP_PX = 6
const SPRING = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } as const
const RETRACT = { duration: 0.26, ease: [0.65, 0, 0.35, 1] } as const

/** Key in screenAnchors (and labels) for a read-only rater node; an album's own id is its catalog row's. */
export const nodeKey = (id: string) => `node:${id}`

/** The page's measurements: where the rater stands, by the window's size and what's open. */
const useBox = () => {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const albumView = useView(v => v.albumView)
  const phone = size.w <= 640
  const top = phone ? 150 : 158, bottom = size.h - (phone ? 228 : 100)
  const wide = size.w >= 1200, desktop = size.w > 900
  /**
   * Kept clear either side: the catalog on the left, the unrated list on the right (their full columns on desktops,
   * their covers alone on phones). The unrated list is hidden in album view, so the right side frees up then.
   */
  const gutterLeft = desktop ? 300 : phone ? 60 : 16
  const gutter = albumView ? (phone ? 16 : 40) : desktop ? 290 : phone ? 60 : 16
  // Album view: the title card and details take the left half (beside the catalog on wide screens, in its place on
  // narrower ones); the rater moves over to the right of them. Phones: the title card is at the bottom instead.
  const spineX = albumView && wide ? Math.round(size.w * 0.5 + 110)
    : albumView && desktop ? Math.round(size.w * 0.56)
    // Phones: just right of the catalog's covers, everything on the right of it, where there's room for labels.
    : phone ? gutterLeft + 58
    : Math.round(size.w / 2)
  return { ...size, phone, top, height: Math.max(160, bottom - top), spineX, gutter, gutterLeft, radius: phone ? 13 : 15 }
}

/** One thing drawn on a rater: a song, movie or book (draggable), or an artist or album of the read-only rater. */
type Mark = Piece & {
  key: string
  anchor: string
  image?: string
  /** What the glow colour is read from (useGlow): the entity itself. */
  glowId: string
  label: string
  sub?: string
  tier?: string
  kind: 'fruit' | 'artist' | 'album'
  level?: string | null
  dim?: boolean
}

/**
 * The board: the open type's rater, a 2D page. A vertical spine with the scale beside it, 100 at the top and 0 at the
 * bottom; everything on it hangs on a leader line at its score's height. Split view (MUSIC) puts each album on a rater
 * of its own, side by side in a row that scrolls sideways. A click on empty paper closes what's open, then leaves
 * album view, then goes back to the artists.
 */
export const Board = () => {
  useAnchorLoop()
  useCollapse()
  const type = useStore(s => s.activeType)
  const split = useView(isSplit)
  const down = useRef({ x: 0, y: 0 })
  if (!type) return null
  const onClick = (e: React.MouseEvent) => {
    if (Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) >= CLICK_SLOP_PX) return
    if ((e.target as Element).closest('.mark-fruit, .split-caption')) return
    const v = useView.getState()
    if (v.editing) return
    if (v.openId || v.selectedId) v.close()
    else v.goBack()
  }
  return <MotionConfig reducedMotion="user">
    <div className="board" onPointerDown={e => { down.current = { x: e.clientX, y: e.clientY } }} onClick={onClick}>
      {split ? <SplitRow /> : <OneRater />}
    </div>
  </MotionConfig>
}

/** Eases `collapse` towards 1 while the list view is on its way in or up (the list waits for it), back to 0 for the tree. */
const useCollapse = () => {
  useEffect(() => {
    let frame = 0, last = performance.now(), p = collapse.value
    const tick = (now: number) => {
      const target = useView.getState().phase === 'tree' ? 0 : 1, step = Math.min(0.1, (now - last) / 1000) / COLLAPSE_SECONDS
      last = now
      p = target > p ? Math.min(1, p + step) : target < p ? Math.max(0, p - step) : target
      collapse.value = p * p * (3 - 2 * p)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])
}

const fruitMark = (t: { id: string, name: string, image?: string, score?: number, shortTitle?: string }, radius: number, dim: boolean): Mark => {
  const label = t.shortTitle ?? t.name
  return {
    id: t.id, key: t.id, anchor: t.id, glowId: t.id, kind: 'fruit', image: t.image, label, radius,
    position: t.score !== undefined ? t.score / 100 : 0.5, unrated: t.score === undefined,
    // Unrated: an italic serif name (wider) over the Unrated tag.
    labelWidth: t.score === undefined ? Math.max(labelWidth(label, 7.4), 52) : labelWidth(label),
    tier: t.score !== undefined ? songTier(t.score).color : undefined, dim,
  }
}

/** The one rater: everything on the open type's tree that's showing, or MUSIC's read-only rater of artists. */
const OneRater = () => {
  const box = useBox()
  const s = usePersisted()
  const type = useStore(st => st.activeType)!
  const { albumView, hiddenAlbums, rating: batch, drill, zoom, phase } = useView(useShallow(v => ({ albumView: v.albumView, hiddenAlbums: v.hiddenAlbums, rating: v.rating, drill: v.drill, zoom: v.zoom, phase: v.phase })))
  const tree = phase === 'tree'

  const marks = useMemo(() => {
    if (!tree) return []
    const focus = batch ? focusOf(s, type, batch) : null
    const out: Mark[] = []
    // MUSIC's default view: whose things are out (every artist on the rater, or the one picked), and how far in.
    const artists = type === 'music' && !albumView ? new Set(artistNodes(s, hiddenAlbums).map(n => n.id).filter(id => !drill || id === drill)) : null
    const songs = !!artists && zoom === 'songs'
    for (const n of treeNodes(s, type)) {
      const t = n.entity as Track
      const artistOf = t.albumId ? s.albums[t.albumId]?.artistId ?? t.artistId : t.artistId
      const show = albumView ? t.albumId === albumView
        // MUSIC's default view: songs come out zoomed in to songs (their artist on the rater, their album not taken
        // off it), and while being rated after they were typed in.
        : n.collection === 'tracks' ? !!batch?.includes(t.id)
          || (songs && !!artistOf && artists!.has(artistOf) && !(t.albumId && hiddenAlbums.has(t.albumId)))
        : true
      if (show) out.push({ ...fruitMark(t, box.radius, !!focus && !focus.has(t.id)), ...(songs ? { key: `songs:${t.id}`, level: 'songs' } : {}) })
    }
    // Zoomed in to songs, a lot can be out at once: the more there are, the smaller each cover (down to a minimum).
    if (songs) {
      const n = out.filter(m => m.level === 'songs').length
      const r = Math.round(Math.max(box.phone ? 8 : 9, Math.min(box.radius, box.radius * Math.sqrt(40 / Math.max(1, n)))))
      for (const m of out) if (m.level === 'songs') m.radius = r
    }
    if (albumView) {
      out.sort((a, b) => trackOrder(s.tracks[a.id]) - trackOrder(s.tracks[b.id]))
      for (const m of out) m.side = 1
    }
    if (artists && zoom !== 'songs') {
      const nodes = zoom === 'artists' ? artistNodes(s, hiddenAlbums).filter(n => artists.has(n.id))
        : [...artists].flatMap(id => albumNodes(s, hiddenAlbums, id))
      const r = zoom === 'albums' ? box.radius + (box.phone ? 3 : 6) : box.radius + (box.phone ? 6 : 10)
      for (const n of nodes) {
        const g = rating(s, n.id)
        const sub = g.label ? `${g.label}${g.tier ? ` · ${g.tier.name}` : ''}` : 'Unrated'
        out.push({
          id: n.id, key: `${zoom}:${drill ?? ''}:${n.id}`, anchor: nodeKey(n.id), glowId: n.id, kind: n.kind, level: zoom,
          image: n.image, label: n.name, sub, radius: r, position: n.position, unrated: false,
          labelWidth: Math.max(labelWidth(n.name, 7), labelWidth(sub, 5.6)), tier: g.tier?.color,
          dim: !!focus && !focus.has(n.id),
        })
      }
    }
    // Phones: the spine stands near the left edge, so everything goes on its right.
    if (box.phone) for (const m of out) m.side = 1
    return out
  }, [s, type, albumView, hiddenAlbums, batch, drill, zoom, tree, box.radius, box.phone])

  const maxReach = albumView ? Math.max(160, box.w - box.spineX - box.gutter - 10)
    : Math.max(120, Math.min(440, box.w - box.spineX - box.gutter - 10))
  // Leaders start clear of the scale's numbers (left of the spine).
  // Room on the left: up to the catalog (album view puts everything on the right anyway).
  const maxReachLeft = Math.max(120, box.spineX - box.gutterLeft - 10)
  const placed = useMemo(() => placePieces(marks, { height: box.height, minLength: 40, maxReach, maxReachLeft }), [marks, box.height, maxReach, maxReachLeft])

  return <motion.div className="rater" initial={false} animate={{ x: box.spineX }} transition={SPRING} style={{ top: box.top }}>
    <Scale height={box.height} left={albumView && box.w > 900 ? 60 : Math.max(48, Math.min(box.spineX - box.gutterLeft, maxReach + 60))} right={Math.min(box.w - box.spineX - box.gutter, maxReach + 60)} />
    <Spine height={box.height} topKey={TRUNK_TOP_ANCHOR} bottomKey={TRUNK_BOTTOM_ANCHOR} />
    <AnimatePresence>
      {outermostFirst(marks, placed).map(({ m, i }) => <Marker key={m.key} mark={m} at={placed.get(m.id)!} height={box.height}
        delay={m.kind === 'fruit' ? (m.level === 'songs' ? LEVEL_DELAY_MS / 1000 : 0) + Math.min(0.5, i * (m.level === 'songs' ? 0.008 : 0.025)) : LEVEL_DELAY_MS / 1000 + i * 0.05} />)}
    </AnimatePresence>
  </motion.div>
}

/**
 * Drawing order: the furthest out first, so a leader running past nearer pieces goes behind them rather than across
 * them. `i` is each one's place in the original order (for the stagger as they come out).
 */
const outermostFirst = (marks: Mark[], placed: ReadonlyMap<string, Placed>) =>
  marks.map((m, i) => ({ m, i })).sort((a, b) => (placed.get(b.m.id)?.x ?? 0) - (placed.get(a.m.id)?.x ?? 0))

const trackOrder = (t?: Track) => t ? (t.disc ?? 1) * 1000 + (t.number ?? 0) : 0

/**
 * The scale behind the rater: a hairline every 10 points, a little stronger at 0, 50 and 100, reaching `left` and
 * `right` px out from the spine (as far as the rater's pieces can go, clear of the panels either side).
 */
const Scale = ({ height, left, right }: { height: number, left: number, right: number }) =>
  <div className="scale" aria-hidden="true">
    {Array.from({ length: 11 }, (_, i) => i * 10).map((v, i) =>
      <motion.div key={v} className={`scale-line${v % 50 === 0 ? ' major' : ''}`} style={{ top: (1 - v / 100) * height, width: Math.max(0, left) + Math.max(0, right), left: -Math.max(0, left) }}
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.9, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }} />)}
  </div>

/** The spine: a black rule from 0 to 100, numbered every 10 on its left, drawn upwards when it first appears. */
const Spine = ({ height, topKey, bottomKey, numbers = true }: { height: number, topKey: string, bottomKey: string, numbers?: boolean }) => {
  // Measured on the wrapper, not the rule itself: the rule is scaled while it draws in.
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const at = (end: 'top' | 'bottom') => () => {
      const el = ref.current
      if (!el?.isConnected) return null
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: end === 'top' ? r.top : r.top + height, r: 0, visible: true }
    }
    const a = registerAnchor(topKey, at('top')), b = registerAnchor(bottomKey, at('bottom'))
    return () => { a(); b() }
  }, [topKey, bottomKey, height])
  return <div ref={ref} className="spine-wrap" style={{ height }}>
    <motion.div className="spine" style={{ height }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
    {numbers && <Numbers height={height} />}
  </div>
}

/** 0 to 100 every 10, right-aligned against where they're put (the spine's left, or the start of split view's row). */
const Numbers = ({ height }: { height: number }) => <>
  {Array.from({ length: 11 }, (_, i) => i * 10).map((v, i) =>
    <motion.span key={v} className={`spine-number${v % 50 === 0 ? ' major' : ''}`} style={{ top: (1 - v / 100) * height }}
      initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 + 0.04 * i }}>{v}</motion.span>)}
</>

type DragState = { pointerId: number, startY: number, startAt: number, moved: boolean, y: number }

/**
 * One thing on a rater: a leader from the spine, a round cover at its end (ringed in its tier's colour; grey and
 * dashed while unrated) and its label beyond. It grows out of the spine when it appears and draws back in when it
 * goes. Songs, movies and books can be dragged up or down to rate them; a tap selects them (the trash icon) and
 * hovering shows the hover card. The read-only rater's artists and albums are clicked instead.
 */
const Marker = ({ mark: m, at, height, delay }: { mark: Mark, at: Placed, height: number, delay: number }) => {
  const fruit = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)
  const [dragY, setDragY] = useState<number | null>(null)
  const move = useStore(s => s.move)
  useGlow(useStore(s => s.tracks[m.glowId] ?? s.movies[m.glowId] ?? s.books[m.glowId] ?? s.albums[m.glowId] ?? s.artists[m.glowId]))
  useAnchor(m.anchor, fruit)
  const hovered = useView(v => v.hoveredId === m.id)
  const selected = useView(v => v.selectedId === m.id || v.openId === m.id)
  const draggable = m.kind === 'fruit'

  useEffect(() => () => {
    const v = useView.getState()
    if (v.hoveredId === m.id) v.setHovered(null)
    if (v.draggingId === m.id) v.setDragging(null)
    liveScores.delete(m.id)
  }, [m.id])

  const y = dragY ?? at.y
  const side = at.side
  const r = m.radius

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()
    if (!draggable) return
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    drag.current = { pointerId: e.pointerId, startY: e.clientY, startAt: at.y, moved: false, y: at.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || e.pointerId !== d.pointerId) return
    const dy = e.clientY - d.startY
    if (!d.moved && Math.abs(dy) < CLICK_SLOP_PX) return
    if (!d.moved) { d.moved = true; useView.getState().setDragging(m.id) }
    d.y = Math.min(height, Math.max(0, d.startAt + dy))
    liveScores.set(m.id, positionToScore(1 - d.y / height))
    setDragY(d.y)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || e.pointerId !== d.pointerId) return
    drag.current = null
    liveScores.delete(m.id)
    if (d.moved) {
      move(m.id, { position: 1 - d.y / height })
      useView.getState().setDragging(null)
      setDragY(null)
    }
  }
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (dragY !== null) return
    const v = useView.getState()
    if (m.kind === 'artist') v.setDrill(m.id)
    else if (m.kind === 'album') v.logAction(`${m.label} album clicked`)
    else v.toggleSelected(m.id)
  }

  const reach = Math.max(0, at.x - r)
  const labelX = at.x + r + 8
  const dragging = dragY !== null
  const enter = { ...SPRING, delay }

  return <motion.div className={`mark kind-${m.kind}${m.unrated && !dragging ? ' unrated' : ''}${dragging ? ' dragging' : ''}${hovered || selected ? ' lit' : ''}`}
    initial={{ y: at.y, opacity: 1 }}
    animate={{ y, opacity: m.dim && !dragging ? 0.16 : 1 }}
    exit={{ opacity: 0, transition: { duration: 0.18, delay: 0.12 } }}
    transition={dragging ? { duration: 0 } : SPRING}
    style={{ zIndex: dragging ? 30 : hovered ? 20 : m.kind === 'fruit' ? 2 : 3 }}>
    <motion.span className={`mark-leader ${side > 0 ? 'right' : 'left'}`}
      initial={{ width: 0 }} animate={{ width: reach }} exit={{ width: 0, transition: RETRACT }} transition={enter} />
    <motion.div ref={fruit} className="mark-fruit" style={{ width: r * 2, height: r * 2, left: -r, top: -r, ['--tier' as string]: m.tier ?? 'transparent' }}
      initial={{ x: 0, scale: 0 }} animate={{ x: side * at.x, scale: dragging ? 1.18 : 1 }} exit={{ x: 0, scale: 0, transition: RETRACT }}
      transition={dragging ? { scale: { duration: 0.15 } } : enter}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
      // Hover is for mice; a tap selects instead (the trash icon), and shouldn't leave a hover card behind.
      onPointerEnter={e => { if (e.pointerType === 'mouse') useView.getState().setHovered(m.id) }}
      onPointerLeave={() => { if (useView.getState().hoveredId === m.id) useView.getState().setHovered(null) }}
      onClick={onClick}
      role="button" aria-label={m.unrated ? `${m.label}, unrated` : m.label}>
      {m.image ? <img src={m.image} alt="" draggable={false} /> : <span className="mark-blank" />}
    </motion.div>
    {!at.bare && <motion.div className={`mark-label ${side > 0 ? 'right' : 'left'}`}
      initial={{ opacity: 0, x: side * (r + 8) }} animate={{ opacity: 1, x: side * labelX }} exit={{ opacity: 0, x: side * (r + 8), transition: RETRACT }}
      transition={{ ...enter, opacity: { duration: 0.3, delay: delay + 0.15 } }}>
      <span className="mark-name">{m.label}</span>
      {m.unrated && !dragging && m.kind === 'fruit' && <span className="mark-tag">Unrated</span>}
      {m.sub && <span className="mark-sub">{m.sub}</span>}
    </motion.div>}
  </motion.div>
}

/**
 * Split view (MUSIC): every album on the tree on a rater of its own, side by side, so one height is one score across
 * the row (the scale's hairlines run right across). The row scrolls sideways (a wheel scrolls it too); drag a rater
 * by its caption to move it along the row, next to another to compare them. Reset puts the row back in order.
 */
const SplitRow = () => {
  const box = useBox()
  const s = usePersisted()
  const hidden = useView(v => v.hiddenAlbums)
  const order = useView(v => v.raterOrder)
  const setOrder = useView(v => v.setRaterOrder)
  const resets = useView(v => v.resetRequests)
  const scroller = useRef<HTMLDivElement>(null)
  const batch = useView(v => v.rating)
  // Shorter than the one rater, so each one's caption fits under it.
  const height = box.height - CAPTION_PX
  // Clear of the catalog on the left and the unrated list on the right.
  const right = box.gutter, leftEdge = box.gutterLeft

  const marksByKey = useMemo(() => {
    const focus = batch ? focusOf(s, 'music', batch) : null
    const keys = splitLayout(s, hidden, {}).map(sp => sp.key)
    const byKey = new Map(keys.map(k => [k, [] as Mark[]]))
    for (const n of treeNodes(s, 'music')) {
      const t = n.entity as Track, list = byKey.get(raterKey(t))
      if (list) list.push(fruitMark(t, box.radius, !!focus && !focus.has(t.id)))
    }
    for (const list of byKey.values()) list.sort((a, b) => trackOrder(s.tracks[a.id]) - trackOrder(s.tracks[b.id]))
    return byKey
  }, [s, hidden, batch, box.radius])

  const keys = [...marksByKey.keys()]
  const ordered = order ? [...order.filter(k => keys.includes(k)), ...keys.filter(k => !order.includes(k))] : keys
  const orderKey = ordered.join(',')
  // In pairs, back to back: the first of each pair hangs everything to the left of its spine, which sits at the right of
  // its column; the second to the right of a spine at the left of its column. So each pair's spines are close together.
  const columns = useMemo(() => orderKey.split(',').filter(Boolean).map((key, i) => {
    const side: 1 | -1 = i % 2 === 0 ? -1 : 1
    const marks = marksByKey.get(key)!.map(m => ({ ...m, side }))
    const placed = placePieces(marks, { height, minLength: 22, maxReach: box.phone ? 150 : 230 })
    const width = Math.max(box.phone ? 110 : 150, reachOf(marks, placed) + SPLIT_INNER + SPLIT_OUTER)
    return { key, side, marks, placed, width, spineX: side < 0 ? width - SPLIT_INNER : SPLIT_INNER }
  }), [orderKey, marksByKey, height, box.phone])

  raterNow.keys = ordered
  useEffect(() => () => { raterNow.keys = [] }, [])
  useEffect(() => { scroller.current?.scrollTo({ left: 0, behavior: 'smooth' }) }, [resets])
  const total = columns.reduce((n, c) => n + c.width, 0)

  const onWheel = (e: React.WheelEvent) => {
    const el = scroller.current
    if (el && Math.abs(e.deltaY) > Math.abs(e.deltaX)) el.scrollLeft += e.deltaY
  }

  const view = box.w - right - leftEdge, inner = Math.max(total + 128, view)
  const padLeft = Math.max(box.phone ? 44 : 64, (view - total) / 2)
  return <div ref={scroller} className="split-scroller" onWheel={onWheel} style={{ top: box.top - 40, height: height + 40 + CAPTION_PX + 10, right, left: leftEdge }}>
    <div className="split-scale" style={{ top: 40, width: inner }}>
      <Scale height={height} left={0} right={inner} />
      {/* The scale's numbers, once, at the start of the row (the first rater's marks hang on its left). */}
      <div className="split-numbers" style={{ left: padLeft - 6 }}><Numbers height={height} /></div>
    </div>
    <Reorder.Group axis="x" values={ordered} onReorder={setOrder} className="split-row"
      style={{ paddingLeft: padLeft, paddingTop: 40, minWidth: inner }}>
      {columns.map((c, i) => <SplitColumn key={c.key} index={i} column={c} height={height} />)}
    </Reorder.Group>
  </div>
}

/** Room under each split-view rater for its caption (px). */
const CAPTION_PX = 64
/** Split view: spine to its column's edge on the side facing its pair's spine, and room beyond the marks on the other. */
const SPLIT_INNER = 12, SPLIT_OUTER = 30

const SplitColumn = ({ column: c, height, index }: { column: { key: string, side: 1 | -1, marks: Mark[], placed: Map<string, Placed>, width: number, spineX: number }, height: number, index: number }) => {
  const s = usePersisted()
  const controls = useDragControls()
  const album = c.key === SINGLES ? undefined : s.albums[c.key]
  const artist = album?.artistId ? s.artists[album.artistId]?.name : undefined
  const g = album ? rating(s, album.id) : undefined
  return <Reorder.Item value={c.key} dragListener={false} dragControls={controls} className={`split-column ${c.side < 0 ? 'side-left' : 'side-right'}`} style={{ width: c.width }}
    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ ...SPRING, delay: index * 0.06 }}
    whileDrag={{ scale: 1.02, zIndex: 40 }}>
    <div className="split-rater" style={{ height, left: c.spineX }}>
      <Spine height={height} topKey={raterTopAnchor(c.key)} bottomKey={raterBottomAnchor(c.key)} numbers={false} />
      <AnimatePresence>
        {outermostFirst(c.marks, c.placed).map(({ m, i }) => <Marker key={m.key} mark={m} at={c.placed.get(m.id)!} height={height} delay={index * 0.06 + Math.min(0.4, i * 0.02)} />)}
      </AnimatePresence>
    </div>
    <div className="split-caption" onPointerDown={e => { e.stopPropagation(); controls.start(e) }} title="Drag to move along the row">
      <span className="split-caption-bar" style={g?.tier ? { background: g.tier.color } : undefined} />
      <span className="split-caption-name">{album?.name ?? 'Singles'}</span>
      <span className="split-caption-meta">{[artist, g?.label].filter(Boolean).join(' · ')}</span>
    </div>
  </Reorder.Item>
}
