import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, Group, MeshBasicMaterial } from 'three'
import { theme } from '../theme'
import { AXIS_HEIGHT, positionToY } from './world'

const TICKS = 10

/**
 * The ranking medium: a glowing vertical rod with ring-shaped ticks, so it reads the same from every side.
 * Breathes slowly, and grows out from the centre when a board opens.
 */
export const Axis = () => {
  const line = useRef<MeshBasicMaterial>(null)
  const group = useRef<Group>(null)
  const mountedAt = useRef(performance.now())

  // Values above 1 push the rod past the bloom threshold, so it glows.
  const hot = useMemo(() => new Color(theme.signal).multiplyScalar(2.2), [])
  const ticks = useMemo(() => Array.from({ length: TICKS + 1 }, (_, i) => i / TICKS), [])

  useFrame(({ clock }) => {
    const t = Math.min(1, (performance.now() - mountedAt.current) / 700)
    if (group.current) group.current.scale.y = Math.max(0.001, 1 - Math.pow(1 - t, 3))
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
