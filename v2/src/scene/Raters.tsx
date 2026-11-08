import { ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Group, Mesh, Plane, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { type RaterSpot, splitLayout } from '../state/split'
import { usePersisted, useStore } from '../state/store'
import { Trunk } from './Axis'
import { toScreen } from './labels'
import { isSplit, raterBottomAnchor, raterNow, raterTopAnchor, screenAnchors, splitness, useView } from './view'
import { AXIS_HEIGHT } from './world'

/** Seconds for the raters to move apart or back together. */
const SPLIT_SECONDS = 0.7
/** A press that moves further than this (px) is a drag, not a click. */
const CLICK_SLOP_PX = 6
/** Radius of the invisible grip round each trunk, for picking it up: wider as the camera backs off, so it stays
 * about the same size on screen, but never so wide it covers the nearest fruit. */
const GRIP_RADIUS = 0.22
const GRIP_MAX_RADIUS = 0.55
const GRIP_PER_DISTANCE = 0.014

const smooth = (p: number) => p * p * (3 - 2 * p)

/**
 * Split view's raters (MUSIC): a trunk for every album on the tree, in a row (state/split.splitLayout). Eases
 * `splitness` towards split or not, and every frame works out where each rater is on the way (raterNow), which the
 * fruit follow. Drag a trunk to move its rater across the floor (view.moveRater), to bring albums side by side.
 */
export const Raters = () => {
  const s = usePersisted()
  const music = useStore(st => st.activeType === 'music')
  const hidden = useView(v => v.hiddenAlbums)
  const moved = useView(v => v.raterPlaces)
  const spots = useMemo(() => music ? splitLayout(s, hidden, moved) : [], [s, music, hidden, moved])
  const progress = useRef(splitness.value)

  useFrame((_, dt) => {
    const target = music && isSplit(useView.getState()) ? 1 : 0
    const step = Math.min(dt, 0.1) / SPLIT_SECONDS
    progress.current = target > progress.current ? Math.min(1, progress.current + step)
      : target < progress.current ? Math.max(0, progress.current - step) : target
    const k = splitness.value = smooth(progress.current)
    raterNow.keys = spots.map(sp => sp.key)
    // Albums hidden from the tree keep their last place, so their fruit draw back into their own trunk.
    for (const sp of spots) raterNow.places.set(sp.key, { x: sp.x * k, z: sp.z * k, turn: sp.turn * k })
  })
  useEffect(() => () => { splitness.value = 0; raterNow.places.clear(); raterNow.keys = [] }, [])

  return <>{spots.map(sp => <Rater key={sp.key} spot={sp} />)}</>
}

const Rater = ({ spot }: { spot: RaterSpot }) => {
  const group = useRef<Group>(null)
  const grip = useRef<Mesh>(null)
  const { camera, size } = useThree()
  const controls = useThree(st => st.controls) as OrbitControlsImpl | null
  const point = useMemo(() => new Vector3(), [])
  const hit = useMemo(() => new Vector3(), [])
  const drag = useRef<{ pointerId: number, x: number, y: number, moved: boolean, plane: Plane, grab: Vector3 } | null>(null)
  // Only there in split view: even unseen, a mesh catches the pointer.
  const split = useView(isSplit)

  useEffect(() => () => {
    screenAnchors.delete(raterTopAnchor(spot.key)); screenAnchors.delete(raterBottomAnchor(spot.key))
    if (drag.current && controls) controls.enabled = true
  }, [spot.key])

  useFrame(() => {
    const g = group.current, p = raterNow.places.get(spot.key)
    if (!g || !p) return
    g.position.set(p.x, 0, p.z)
    g.visible = splitness.value > 0.02
    const shown = splitness.value > 0.5
    if (grip.current) {
      const r = Math.min(GRIP_MAX_RADIUS, Math.max(GRIP_RADIUS, camera.position.distanceTo(g.position) * GRIP_PER_DISTANCE))
      grip.current.scale.set(r, 1, r)
    }
    point.set(p.x, AXIS_HEIGHT / 2, p.z)
    const top = toScreen(point, camera, size)
    screenAnchors.set(raterTopAnchor(spot.key), { x: top.x, y: top.y, r: 0, visible: shown && top.inFront })
    point.set(p.x, -AXIS_HEIGHT / 2, p.z)
    const bottom = toScreen(point, camera, size)
    screenAnchors.set(raterBottomAnchor(spot.key), { x: bottom.x, y: bottom.y, r: 0, visible: shown && bottom.inFront })
  })

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0 || splitness.value < 0.5) return
    e.stopPropagation()
    if (controls) controls.enabled = false
    ;(e.target as Element).setPointerCapture(e.pointerId)
    // Carried on a level plane at the height it was picked up, so it slides across the floor under the pointer.
    const plane = new Plane(new Vector3(0, 1, 0), -e.point.y)
    drag.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false, plane, grab: e.point.clone().sub(new Vector3(spot.x, 0, spot.z)) }
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (!d || e.pointerId !== d.pointerId) return
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < CLICK_SLOP_PX) return
    if (!d.moved) { d.moved = true; document.body.style.cursor = 'grabbing' }
    if (e.ray.intersectPlane(d.plane, hit)) useView.getState().moveRater(spot.key, hit.x - d.grab.x, hit.z - d.grab.z)
  }
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (!d || e.pointerId !== d.pointerId) return
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    drag.current = null
    if (controls) controls.enabled = true
    document.body.style.cursor = ''
  }

  return <group ref={group} visible={false}>
    <Trunk />
    {/* the grip: an invisible sleeve round the trunk, wider than the rod, to pick the rater up by */}
    {split && <mesh ref={grip} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      onPointerOver={e => { e.stopPropagation(); if (!drag.current && splitness.value > 0.5) document.body.style.cursor = 'grab' }}
      onPointerOut={() => { if (!drag.current) document.body.style.cursor = '' }}>
      <cylinderGeometry args={[1, 1, AXIS_HEIGHT, 8]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>}
  </group>
}
