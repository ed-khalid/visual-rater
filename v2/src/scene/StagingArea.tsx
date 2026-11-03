import { ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Group, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { useStore } from '../state/store'
import { CoverSphere } from './CoverSphere'
import { labelElements, placeBelowLabel, toScreen } from './labels'
import { screenAnchors, useView } from './view'
import { cameraDistanceFor } from './world'

const RADIUS = 0.42
/** A press that moves further than this (px) is a drag (orbiting), not a click. */
const CLICK_SLOP_PX = 6
/** Vertical spacing between floating spheres, and the band of height they float in. */
const SPACING = 1.25
const TOP = 2.6
const BOTTOM = -3

/** Shortest signed turn from one angle to another. */
const angleDelta = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

/** Small stable per-item numbers, so each sphere has its own drift, spin and offset. */
const seeded = (id: string, salt: number) => {
  let h = 2166136261 ^ salt
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return ((h >>> 0) % 10000) / 10000
}

/**
 * Items added but not placed yet: cover spheres floating in space beside the tree, as if suspended in a vacuum.
 * They live in the world (not on the screen), so they turn around you with the tree as you orbit. Each one holds
 * its place and spins slowly on its own axis.
 *
 * They float off to the left of where the camera starts, as far out as the screen allows at that point.
 * Hover one for its details; click it for its tracklist. While hovered or open it stops spinning and turns its
 * cover towards you, so it's readable.
 */
export const StagingArea = () => {
  const staged = useStore(s => s.staged)
  const items = useStore(s => s.items)
  const activeBoardId = useStore(s => s.activeBoardId)
  const here = staged.filter(st => st.boardId === activeBoardId && items[st.itemId])
  const { camera, size } = useThree()

  // Visible half-width at the trunk from the starting viewpoint; float about 70% of the way out to the left.
  const x0 = useMemo(() => {
    const fov = (camera as PerspectiveCamera).fov * Math.PI / 180
    const halfWidth = cameraDistanceFor(size.width / size.height) * Math.tan(fov / 2) * (size.width / size.height)
    return -Math.min(6, halfWidth * 0.7)
  }, [camera, size.width, size.height])

  const spacing = Math.min(SPACING, (TOP - BOTTOM) / Math.max(1, here.length - 1))
  const top = Math.min(TOP, (spacing * (here.length - 1)) / 2 + 0.6)

  return <>{here.map((st, i) => {
    const id = st.itemId
    const anchor = new Vector3(x0 + (seeded(id, 1) - 0.5) * 0.7, top - i * spacing, (seeded(id, 2) - 0.5) * 1.4)
    return <Floating key={id} id={id} image={items[id].image} anchor={anchor} />
  })}</>
}

const Floating = ({ id, image, anchor }: { id: string, image?: string, anchor: Vector3 }) => {
  const group = useRef<Group>(null)
  const pos = useRef(anchor.clone())
  const bornAt = useRef(performance.now())
  const below = useMemo(() => new Vector3(), [])
  const { camera, size } = useThree()
  const phase = useMemo(() => seeded(id, 3) * Math.PI * 2, [id])
  const spin = useMemo(() => 0.15 + seeded(id, 4) * 0.2, [id])
  const motion = useRef({ turn: phase, still: 0 })
  const setHovered = useView(v => v.setHovered)
  const toggleOpen = useView(v => v.toggleOpen)

  useEffect(() => () => {
    screenAnchors.delete(id)
    const v = useView.getState()
    if (v.hoveredId === id) v.setHovered(null)
    if (v.openId === id) v.close()
    document.body.style.cursor = ''
  }, [id])

  const onOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(id); document.body.style.cursor = 'pointer' }
  const onOut = () => { if (useView.getState().hoveredId === id) setHovered(null); document.body.style.cursor = '' }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > CLICK_SLOP_PX) return // that was a drag to orbit
    e.stopPropagation()
    toggleOpen(id)
  }

  useFrame(({ clock }, dt) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    const v = useView.getState()
    // Hovered or open: ease to a stop, facing the camera; otherwise keep the slow weightless spin.
    const m = motion.current
    m.still = MathUtils.damp(m.still, v.hoveredId === id || v.openId === id ? 1 : 0, 6, dt)
    // Hold still at the anchor; only glide when the anchor itself moves (the tray reflows as albums come and go).
    pos.current.x = MathUtils.damp(pos.current.x, anchor.x, 4, dt)
    pos.current.y = MathUtils.damp(pos.current.y, anchor.y, 4, dt)
    pos.current.z = MathUtils.damp(pos.current.z, anchor.z, 4, dt)
    g.position.copy(pos.current)
    m.turn += spin * (1 - m.still) * dt
    const facing = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z)
    g.rotation.y = m.turn + angleDelta(m.turn, facing) * m.still
    g.rotation.x = Math.sin(t * 0.2 + phase) * 0.25 * (1 - m.still)
    const age = (performance.now() - bornAt.current) / 1000
    g.scale.setScalar(Math.max(0.01, Math.min(1, age * 3)))

    const centre = toScreen(g.position, camera, size)
    const r = (RADIUS / (camera.position.distanceTo(g.position) * Math.tan((camera as PerspectiveCamera).fov * Math.PI / 360))) * size.height / 2
    screenAnchors.set(id, { x: centre.x, y: centre.y, r, visible: centre.inFront })

    const label = labelElements.get(id)
    if (label) {
      below.copy(g.position).y -= RADIUS + 0.12
      const p = toScreen(below, camera, size)
      placeBelowLabel(label, p.x, p.y + 4, (p.inFront ? 1 : 0) * Math.min(1, age * 3))
    }
  })

  return <group ref={group} position={anchor.toArray()} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
    <CoverSphere image={image} radius={RADIUS} rimStrength={1.6} />
  </group>
}
