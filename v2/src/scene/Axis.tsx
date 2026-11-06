import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, Group, MeshBasicMaterial, Vector3 } from 'three'
import { theme } from '../theme'
import { scaleElements, toScreen } from './labels'
import { screenAnchors, TRUNK_BOTTOM_ANCHOR, TRUNK_TOP_ANCHOR } from './view'
import { AXIS_HEIGHT, positionToY } from './world'

const TICKS = 10
/** Gap between the trunk and its score labels (CSS px): clear of the widest (major) tick rings. */
const SCALE_OFFSET_PX = 30

/**
 * The ranking medium: a glowing vertical rod with ring-shaped ticks, so it reads the same from every side, and
 * its score scale (0 at the bottom, 100 at the top) labelled beside the ticks.
 * Breathes slowly, and grows out from the centre when a board opens.
 */
export const Axis = () => {
  const line = useRef<MeshBasicMaterial>(null)
  const group = useRef<Group>(null)
  const mountedAt = useRef(performance.now())

  // Values above 1 push the rod past the bloom threshold, so it glows.
  const hot = useMemo(() => new Color(theme.signal).multiplyScalar(2.2), [])
  const ticks = useMemo(() => Array.from({ length: TICKS + 1 }, (_, i) => i / TICKS), [])
  const point = useMemo(() => new Vector3(), [])
  const { camera, size } = useThree()

  useFrame(({ clock }) => {
    const t = Math.min(1, (performance.now() - mountedAt.current) / 700)
    const grow = Math.max(0.001, 1 - Math.pow(1 - t, 3))
    if (group.current) group.current.scale.y = grow
    // Score labels (0 … 100) beside each tick, just left of the trunk on screen, whichever way the board is turned.
    for (const tick of ticks) {
      const el = scaleElements.get(Math.round(tick * 100))
      if (!el) continue
      point.set(0, positionToY(tick) * grow, 0)
      const p = toScreen(point, camera, size)
      el.style.transform = `translate(${Math.round(p.x - SCALE_OFFSET_PX)}px, ${Math.round(p.y)}px) translate(-100%, -50%)`
      el.style.opacity = p.inFront ? String(t) : '0'
    }
    // The top of the trunk on screen, for the tree/list switch that sits above it and the list view that opens out of it (the trunk is the axis the board
    // turns around, so this only moves when zooming).
    point.set(0, (AXIS_HEIGHT / 2) * grow, 0)
    const top = toScreen(point, camera, size)
    screenAnchors.set(TRUNK_TOP_ANCHOR, { x: top.x, y: top.y, r: 0, visible: top.inFront && t >= 1 })
    point.set(0, (-AXIS_HEIGHT / 2) * grow, 0)
    const bottom = toScreen(point, camera, size)
    screenAnchors.set(TRUNK_BOTTOM_ANCHOR, { x: bottom.x, y: bottom.y, r: 0, visible: bottom.inFront && t >= 1 })
    if (line.current) line.current.color.copy(hot).multiplyScalar(0.85 + 0.15 * Math.sin(clock.elapsedTime * 0.8))
  })

  return <group ref={group} scale={[1, 0.001, 1]}>
    <mesh>
      <cylinderGeometry args={[0.018, 0.018, AXIS_HEIGHT, 12]} />
      <meshBasicMaterial ref={line} color={hot} toneMapped={false} />
    </mesh>
    {ticks.map(t => {
      const major = t === 0 || t === 0.5 || t === 1
      return <mesh key={t} position={[0, positionToY(t), 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[major ? 0.2 : 0.09, 0.006, 6, 48]} />
        <meshBasicMaterial color={major ? theme.signal : theme.signalDim} toneMapped={false} />
      </mesh>
    })}
  </group>
}
