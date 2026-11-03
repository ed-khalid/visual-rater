import { ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Color, Group, MathUtils, Mesh, PerspectiveCamera, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { MAX_BRANCH_LENGTH, MIN_BRANCH_LENGTH } from '../state/layout'
import { Item, Placement, positionToScore, useStore } from '../state/store'
import { theme } from '../theme'
import { CoverSphere } from './CoverSphere'
import { labelElements, placeSideLabel, toScreen } from './labels'
import { liveScores, screenAnchors, useView } from './view'
import { AXIS_HEIGHT, NODE_RADIUS, positionToY } from './world'

/** How much lower than its fruit a branch leaves the trunk. 0: branches are horizontal, level with their fruit. */
const BRANCH_RISE = 0
const LABEL_OFFSET_PX = 12
/** A press that moves further than this (px) is a drag, not a tap. */
const CLICK_SLOP_PX = 6

/** Every item placed on the active board: a fruit on its own branch of the tree. */
export const Items = () => {
  const placements = useStore(s => s.placements)
  const items = useStore(s => s.items)
  const activeBoardId = useStore(s => s.activeBoardId)
  const onBoard = useMemo(() => placements.filter(p => p.boardId === activeBoardId && items[p.itemId]), [placements, items, activeBoardId])
  return <>{onBoard.map(p => <Fruit key={p.itemId} item={items[p.itemId]} placement={p} />)}</>
}

type FruitProps = { item: Item, placement: Placement }

/** Shortest signed turn from one angle to another, so a branch never spins the long way round. */
const angleDelta = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

type Drag = {
  pointerId: number
  startX: number
  startY: number
  startPosition: number
  startLength: number
  /** +1 if the fruit is right of the trunk on screen (dragging right lengthens), -1 if left. */
  outward: number
  /** World units per screen px at the fruit's depth, fixed at the start of the drag. */
  unitsPerPx: number
  moved: boolean
  position: number
  length: number
}

/**
 * One item. The group sits on the trunk at the fruit's height, turned to its stored branch direction; inside it a
 * thin glowing branch rises from the trunk to the fruit, and the fruit's cover faces outward along the branch.
 * Everything is fixed to the tree, so walking around it shows each fruit from the front, side or back.
 *
 * Drag the fruit up or down to move it along the trunk; drag it away from or towards the trunk (on screen) to
 * lengthen or shorten its branch. Its direction around the trunk doesn't change. The board doesn't rotate while
 * dragging, and a faint ring at the fruit's height shows the circle its branch sweeps, for lining things up.
 */
const Fruit = ({ item, placement }: FruitProps) => {
  const group = useRef<Group>(null)
  const fruit = useRef<Group>(null)
  const stem = useRef<Mesh>(null)
  const guide = useRef<Group>(null)
  const glow = useMemo(() => new Color(theme.signal).multiplyScalar(1.3), [])
  const bornAt = useRef(performance.now())
  const isNew = useRef(Date.now() - placement.placedAt < 1500).current
  const state = useRef({ y: positionToY(placement.position), angle: placement.angle, length: isNew ? 0 : placement.length })
  const drag = useRef<Drag | null>(null)
  const [dragging, setDragging] = useState(false)
  const world = useMemo(() => new Vector3(), [])
  const trunk = useMemo(() => new Vector3(), [])
  const { camera, size } = useThree()
  const controls = useThree(s => s.controls) as OrbitControlsImpl | null
  const movePlacement = useStore(s => s.movePlacement)
  const autoAlignBoard = useStore(s => s.autoAlignBoard)

  useEffect(() => () => {
    screenAnchors.delete(item.id)
    const v = useView.getState()
    if (v.hoveredId === item.id) { v.setHovered(null); document.body.style.cursor = '' }
    if (v.selectedId === item.id) v.toggleSelected(item.id)
    if (v.draggingId === item.id) v.setDragging(null)
  }, [item.id])

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    useView.getState().setHovered(item.id)
    if (!drag.current) document.body.style.cursor = 'grab'
  }
  const onOut = () => {
    if (useView.getState().hoveredId === item.id) useView.getState().setHovered(null)
    if (!drag.current) document.body.style.cursor = ''
  }
  // A tap (no drag) selects the fruit, which is how touch screens (no hover) get to its trash icon.
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > CLICK_SLOP_PX) return
    e.stopPropagation()
    useView.getState().toggleSelected(item.id)
  }

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    // Hold the board still while this fruit is being dragged.
    if (controls) controls.enabled = false
    ;(e.target as Element).setPointerCapture(e.pointerId)
    const st = state.current
    world.set(Math.sin(st.angle) * st.length, st.y, Math.cos(st.angle) * st.length)
    trunk.set(0, st.y, 0)
    const fruitX = toScreen(world, camera, size).x, trunkX = toScreen(trunk, camera, size).x
    const fov = (camera as PerspectiveCamera).fov * Math.PI / 180
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPosition: placement.position,
      startLength: placement.length,
      outward: fruitX < trunkX - 2 ? -1 : 1,
      unitsPerPx: (2 * camera.position.distanceTo(world) * Math.tan(fov / 2)) / size.height,
      moved: false,
      position: placement.position,
      length: placement.length,
    }
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (!d || e.pointerId !== d.pointerId) return
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY
    if (!d.moved && Math.hypot(dx, dy) < CLICK_SLOP_PX) return
    if (!d.moved) {
      d.moved = true
      setDragging(true)
      useView.getState().setDragging(item.id)
      document.body.style.cursor = 'grabbing'
    }
    d.position = MathUtils.clamp(d.startPosition - (dy * d.unitsPerPx) / AXIS_HEIGHT, 0, 1)
    liveScores.set(item.id, positionToScore(d.position))
    d.length = MathUtils.clamp(d.startLength + d.outward * dx * d.unitsPerPx, MIN_BRANCH_LENGTH, MAX_BRANCH_LENGTH)
  }

  const endDrag = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (!d || e.pointerId !== d.pointerId) return
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    drag.current = null
    if (controls) controls.enabled = true
    liveScores.delete(item.id)
    if (d.moved) {
      movePlacement(item.id, { position: d.position, length: d.length })
      // A drag that changed the item's height re-aligns the whole tree; a stem-length-only drag is left as set.
      if (Math.abs(d.position - d.startPosition) > 1e-4) autoAlignBoard()
      setDragging(false)
      useView.getState().setDragging(null)
      document.body.style.cursor = useView.getState().hoveredId === item.id ? 'grab' : ''
    }
  }

  useFrame((_, dt) => {
    const g = group.current, f = fruit.current, s = stem.current
    if (!g || !f || !s) return
    const st = state.current
    const d = drag.current
    // While dragging, follow the pointer closely; otherwise ease to the stored placement.
    const targetY = positionToY(d?.moved ? d.position : placement.position)
    const targetLength = d?.moved ? d.length : placement.length
    const ease = d?.moved ? 22 : 8
    st.y = MathUtils.damp(st.y, targetY, ease, dt)
    st.angle += angleDelta(st.angle, placement.angle) * (1 - Math.exp(-8 * dt))
    st.length = MathUtils.damp(st.length, targetLength, d?.moved ? ease : isNew ? 6 : 8, dt)

    const age = (performance.now() - bornAt.current) / 1000
    const pop = isNew ? Math.min(1, age * 4) * (1 + 0.35 * Math.exp(-age * 5) * Math.cos(age * 16)) : 1

    g.position.set(0, st.y, 0)
    g.rotation.y = st.angle
    f.position.set(0, 0, st.length)
    f.scale.setScalar(Math.max(0.01, pop) * (d?.moved ? 1.12 : 1))
    // Stem: from the trunk (BRANCH_RISE lower) up to the fruit, in the group's local Y–Z plane.
    const run = Math.max(0.001, st.length - NODE_RADIUS * 0.9)
    s.position.set(0, -BRANCH_RISE / 2, run / 2)
    s.scale.set(1, Math.hypot(run, BRANCH_RISE), 1)
    s.rotation.x = Math.atan2(run, BRANCH_RISE)
    // Alignment guide: the circle this branch sweeps around the trunk, at the fruit's height.
    if (guide.current) guide.current.scale.setScalar(st.length)

    world.set(Math.sin(st.angle) * st.length, st.y, Math.cos(st.angle) * st.length)
    trunk.set(0, st.y, 0)
    const p = toScreen(world, camera, size)
    const dist = camera.position.distanceTo(world)
    const r = (NODE_RADIUS * pop / (dist * Math.tan((camera as PerspectiveCamera).fov * Math.PI / 360))) * size.height / 2
    screenAnchors.set(item.id, { x: p.x, y: p.y, r, visible: p.inFront })

    const label = labelElements.get(item.id)
    if (label) {
      const left = p.x < toScreen(trunk, camera, size).x - 1
      // Fruit behind the trunk (as seen from here) lose their labels, so the far side doesn't clutter the near.
      const behind = dist - camera.position.distanceTo(trunk)
      const fade = d?.moved ? 1 : MathUtils.clamp(1 - (behind + 0.2) / 0.6, 0, 1)
      const offset = LABEL_OFFSET_PX + r
      const w = label.offsetWidth
      const side = left ? !(p.x - offset - w < 0) : p.x + offset + w > size.width
      placeSideLabel(label, p.x, p.y, side, offset, Math.min(1, pop) * fade * (p.inFront ? 1 : 0))
    }
  })

  return <group ref={group} position={[0, state.current.y, 0]} rotation={[0, placement.angle, 0]}>
    <mesh ref={stem}>
      {/* unit-height cylinder, stretched to the branch's length each frame */}
      <cylinderGeometry args={[0.007, 0.012, 1, 6]} />
      <meshBasicMaterial color={glow} toneMapped={false} transparent opacity={0.75} />
    </mesh>
    {dragging && <group ref={guide}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        {/* unit circle, scaled to the branch length each frame */}
        <ringGeometry args={[0.994, 1.006, 128]} />
        <meshBasicMaterial color={theme.signal} transparent opacity={0.35} toneMapped={false} side={2} />
      </mesh>
    </group>}
    <group
      ref={fruit}
      onPointerOver={onOver}
      onPointerOut={onOut}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <CoverSphere image={item.image} radius={NODE_RADIUS} />
    </group>
  </group>
}
